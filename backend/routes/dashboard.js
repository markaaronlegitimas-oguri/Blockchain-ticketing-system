// routes/dashboard.js
// Real-Time Event Dashboard (Requirement e): live sales, check-in and
// slot-availability numbers for organizers, staff and admins.

const express = require('express');
const supabase = require('../supabaseClient');
const { requireAuth, requireRole } = require('../middleware/auth');

const router = express.Router();

// GET /api/dashboard/summary
router.get(
  '/summary',
  requireAuth,
  requireRole('organizer', 'staff', 'admin'),
  async (req, res) => {
    try {
      const [events, sessions, slots, tickets, bookings] = await Promise.all([
        supabase.from('events').select('id, name, ticket_price, max_tickets'),
        supabase.from('sessions').select('id, event_id, session_name, starts_at'),
        supabase.from('slots').select('id, session_id, slot_name, price, capacity'),
        supabase.from('tickets').select('id, event_id, status'),
        supabase.from('bookings').select('id, slot_id, status, expires_at'),
      ]);

      for (const r of [events, sessions, slots, tickets, bookings]) {
        if (r.error) throw r.error;
      }

      const now = Date.now();
      const isSold = (t) => t.status === 'sold' || t.status === 'used';

      // Bookings per slot: confirmed ones, and pending holds that have not expired yet.
      const confirmedBySlot = {};
      const pendingBySlot = {};
      for (const b of bookings.data) {
        if (b.status === 'confirmed') {
          confirmedBySlot[b.slot_id] = (confirmedBySlot[b.slot_id] || 0) + 1;
        } else if (b.status === 'pending' && new Date(b.expires_at).getTime() > now) {
          pendingBySlot[b.slot_id] = (pendingBySlot[b.slot_id] || 0) + 1;
        }
      }

      const eventSummaries = events.data.map((ev) => {
        const evTickets = tickets.data.filter((t) => t.event_id === ev.id);
        const sold = evTickets.filter(isSold).length;
        const checkedIn = evTickets.filter((t) => t.status === 'used').length;
        const price = Number(ev.ticket_price) || 0;

        const evSessions = sessions.data
          .filter((s) => s.event_id === ev.id)
          .map((s) => ({
            id: s.id,
            name: s.session_name,
            startsAt: s.starts_at,
            slots: slots.data
              .filter((sl) => sl.session_id === s.id)
              .map((sl) => {
                const confirmed = confirmedBySlot[sl.id] || 0;
                const pending = pendingBySlot[sl.id] || 0;
                return {
                  id: sl.id,
                  name: sl.slot_name,
                  price: sl.price,
                  capacity: sl.capacity,
                  confirmed,
                  pending,
                  available: Math.max(sl.capacity - confirmed - pending, 0),
                };
              }),
          }));

        return {
          id: ev.id,
          name: ev.name,
          ticketPriceEth: price,
          maxTickets: ev.max_tickets,
          sold,
          checkedIn,
          revenueEth: Number((sold * price).toFixed(6)),
          sessions: evSessions,
        };
      });

      const totals = eventSummaries.reduce(
        (acc, e) => {
          acc.ticketsSold += e.sold;
          acc.checkedIn += e.checkedIn;
          acc.revenueEth += e.revenueEth;
          return acc;
        },
        { ticketsSold: 0, checkedIn: 0, revenueEth: 0 }
      );
      totals.revenueEth = Number(totals.revenueEth.toFixed(6));
      totals.activeHolds = Object.values(pendingBySlot).reduce((a, b) => a + b, 0);
      totals.checkInRate = totals.ticketsSold
        ? Math.round((totals.checkedIn / totals.ticketsSold) * 100)
        : 0;

      res.json({ generatedAt: new Date().toISOString(), totals, events: eventSummaries });
    } catch (error) {
      console.error('[GET /dashboard/summary]', error.message);
      res.status(500).json({ error: error.message });
    }
  }
);

module.exports = router;