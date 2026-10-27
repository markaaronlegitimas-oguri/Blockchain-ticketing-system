// routes/reports.js
// Report Generation (Requirement f): downloadable CSV reports for
// organizers, staff and admins. Opens directly in Excel / Google Sheets.
//
//   GET /api/reports/sales.csv       sales summary per ticket tier (slot)
//   GET /api/reports/attendance.csv  every ticket with holder + check-in status

const express = require('express');
const supabase = require('../supabaseClient');
const { requireAuth, requireRole } = require('../middleware/auth');

const router = express.Router();
const guard = [requireAuth, requireRole('organizer', 'staff', 'admin')];

// --- CSV helpers -----------------------------------------------------------

function cell(value) {
  let s = value === null || value === undefined ? '' : String(value);
  // Stop spreadsheet formula injection from user-supplied text (e.g. a name like =1+1)
  if (/^[=+\-@\t\r]/.test(s)) s = "'" + s;
  if (/[",\n\r]/.test(s)) s = '"' + s.replace(/"/g, '""') + '"';
  return s;
}

function toCsv(headers, rows) {
  const lines = [headers.map(cell).join(',')];
  for (const row of rows) lines.push(row.map(cell).join(','));
  return '\uFEFF' + lines.join('\r\n') + '\r\n'; // BOM so Excel reads UTF-8 correctly
}

function sendCsv(res, filename, csv) {
  res.setHeader('Content-Type', 'text/csv; charset=utf-8');
  res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
  res.send(csv);
}

const indexBy = (list, key) => Object.fromEntries(list.map((item) => [item[key], item]));

async function loadData() {
  const [events, sessions, slots, tickets, bookings, users] = await Promise.all([
    supabase.from('events').select('id, name, ticket_price'),
    supabase.from('sessions').select('id, event_id, session_name, starts_at'),
    supabase.from('slots').select('id, session_id, slot_name, capacity'),
    supabase.from('tickets').select('id, onchain_ticket_id, event_id, session_id, owner_id, status'),
    supabase.from('bookings').select('id, slot_id, ticket_id, status'),
    supabase.from('users').select('id, full_name, email, wallet_address'),
  ]);
  for (const r of [events, sessions, slots, tickets, bookings, users]) {
    if (r.error) throw r.error;
  }
  return {
    events: events.data,
    sessions: sessions.data,
    slots: slots.data,
    tickets: tickets.data,
    bookings: bookings.data,
    users: users.data,
  };
}

// --- Sales report ----------------------------------------------------------

router.get('/sales.csv', ...guard, async (req, res) => {
  try {
    const d = await loadData();
    const eventById = indexBy(d.events, 'id');
    const sessionById = indexBy(d.sessions, 'id');
    const ticketById = indexBy(d.tickets, 'id');

    const headers = [
      'Event', 'Session', 'Session start', 'Ticket tier', 'Capacity',
      'Tickets sold', 'Remaining', 'Checked in', 'Price (ETH)', 'Revenue (ETH)',
    ];
    const rows = [];
    const total = { capacity: 0, sold: 0, remaining: 0, checkedIn: 0, revenue: 0 };

    for (const slot of d.slots) {
      const session = sessionById[slot.session_id];
      const event = session && eventById[session.event_id];
      if (!session || !event) continue;

      const confirmed = d.bookings.filter((b) => b.slot_id === slot.id && b.status === 'confirmed');
      const sold = confirmed.length;
      const checkedIn = confirmed.filter((b) => ticketById[b.ticket_id]?.status === 'used').length;
      const price = Number(event.ticket_price) || 0;
      const revenue = Number((sold * price).toFixed(6));
      const remaining = Math.max(slot.capacity - sold, 0);

      rows.push([
        event.name, session.session_name, new Date(session.starts_at).toISOString(),
        slot.slot_name, slot.capacity, sold, remaining, checkedIn, price, revenue,
      ]);
      total.capacity += slot.capacity;
      total.sold += sold;
      total.remaining += remaining;
      total.checkedIn += checkedIn;
      total.revenue += revenue;
    }

    rows.push([
      'TOTAL', '', '', '', total.capacity, total.sold, total.remaining,
      total.checkedIn, '', Number(total.revenue.toFixed(6)),
    ]);

    sendCsv(res, 'sales-report.csv', toCsv(headers, rows));
  } catch (error) {
    console.error('[GET /reports/sales.csv]', error.message);
    res.status(500).json({ error: error.message });
  }
});

// --- Attendance report -----------------------------------------------------

router.get('/attendance.csv', ...guard, async (req, res) => {
  try {
    const d = await loadData();
    const eventById = indexBy(d.events, 'id');
    const sessionById = indexBy(d.sessions, 'id');
    const slotById = indexBy(d.slots, 'id');
    const userById = indexBy(d.users, 'id');
    const bookingByTicket = {};
    for (const b of d.bookings) {
      if (b.status === 'confirmed' && b.ticket_id) bookingByTicket[b.ticket_id] = b;
    }

    const headers = [
      'Ticket #', 'Event', 'Session', 'Ticket tier', 'Holder name',
      'Holder email', 'Holder wallet', 'Status', 'Checked in',
    ];

    const rows = [...d.tickets]
      .sort((a, b) => a.onchain_ticket_id - b.onchain_ticket_id)
      .map((t) => {
        const event = eventById[t.event_id];
        const session = sessionById[t.session_id];
        const booking = bookingByTicket[t.id];
        const slot = booking && slotById[booking.slot_id];
        const owner = userById[t.owner_id];
        return [
          t.onchain_ticket_id,
          event ? event.name : '',
          session ? session.session_name : '',
          slot ? slot.slot_name : '',
          owner ? owner.full_name : '',
          owner ? owner.email : '',
          owner ? owner.wallet_address : '',
          t.status,
          t.status === 'used' ? 'Yes' : 'No',
        ];
      });

    sendCsv(res, 'attendance-report.csv', toCsv(headers, rows));
  } catch (error) {
    console.error('[GET /reports/attendance.csv]', error.message);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;