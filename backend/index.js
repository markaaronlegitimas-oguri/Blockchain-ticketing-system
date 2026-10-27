const express = require('express');
const cors = require('cors');
require('dotenv').config();
const contract = require('./contracts');
const supabase = require('./supabaseClient');
const authRoutes = require('./routes/auth');
const slotRoutes = require('./routes/slots');
const eventRoutes = require('./routes/events');
const ticketRoutes = require('./routes/tickets');
const dashboardRoutes = require('./routes/dashboard');
const reportRoutes = require('./routes/reports');
const { requireAuth, requireRole } = require('./middleware/auth');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use('/api/auth', authRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/tickets', ticketRoutes);
app.use('/api', slotRoutes);

app.get('/', (req, res) => {
  res.json({ message: 'Blockchain Ticketing System API is running!' });
});

app.get('/api/contract-info', async (req, res) => {
  try {
    const organizer = await contract.organizer();
    const eventName = await contract.eventName();
    res.json({ organizer, eventName, contractAddress: process.env.CONTRACT_ADDRESS });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/test-supabase', async (req, res) => {
  const { data, error } = await supabase.from('events').select('*').limit(5);
  if (error) return res.status(500).json({ error: error.message });
  res.json({ message: 'Supabase connected!', events: data });
});

// Organizer/admin only: issue tickets on-chain for an event
app.post('/api/events/:eventId/issue-tickets', requireAuth, requireRole('organizer', 'admin'), async (req, res) => {
  const { eventId } = req.params;
  const { count } = req.body;

  if (!count) {
    return res.status(400).json({ error: 'count is required' });
  }

  try {
    // Confirm the event exists
    const { data: event, error: eventError } = await supabase
      .from('events')
      .select('id, name')
      .eq('id', eventId)
      .single();

    if (eventError || !event) {
      return res.status(404).json({ error: 'Event not found' });
    }

    // Call the smart contract to issue tickets on-chain
    const tx = await contract.issueTickets(count);
    const receipt = await tx.wait();

    res.json({
      message: `${count} tickets issued on-chain for "${event.name}"`,
      txHash: tx.hash,
      blockNumber: receipt.blockNumber,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

// 1. Generate a scannable QR code image for a ticket (by qr_code payload)
const QRCode = require('qrcode'); // npm install qrcode first

app.get('/api/tickets/:ticketId/qr-image', async (req, res) => {
  try {
    const { ticketId } = req.params;

    const { data: ticket, error } = await supabase
      .from('tickets')
      .select('qr_code, status')
      .eq('id', ticketId)
      .single();

    if (error || !ticket) {
      return res.status(404).json({ error: 'Ticket not found' });
    }

    const qrImageDataUrl = await QRCode.toDataURL(ticket.qr_code);
    res.json({ qrImage: qrImageDataUrl, status: ticket.status });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 2. Check-in endpoint - staff/admin only, marks a ticket 'used'
app.post('/api/tickets/check-in', requireAuth, requireRole('staff', 'admin'), async (req, res) => {
  const { qrCode } = req.body;

  if (!qrCode) {
    return res.status(400).json({ error: 'qrCode is required' });
  }

  try {
    const { data: ticket, error: findError } = await supabase
      .from('tickets')
      .select('*')
      .eq('qr_code', qrCode)
      .single();

    if (findError || !ticket) {
      return res.status(404).json({ error: 'Ticket not found' });
    }

    if (ticket.status === 'used') {
      return res.status(409).json({ error: 'Ticket already checked in' });
    }
    if (ticket.status !== 'sold') {
      return res.status(409).json({ error: `Ticket is not valid for check-in (status: ${ticket.status})` });
    }

    // Only flip sold -> used. If two scans race, exactly one of them updates a row.
    const { error: updateError, count } = await supabase
      .from('tickets')
      .update({ status: 'used' }, { count: 'exact' })
      .eq('id', ticket.id)
      .eq('status', 'sold');

    if (updateError) throw updateError;
    if (!count) {
      return res.status(409).json({ error: 'Ticket already checked in' });
    }
    const updated = { ...ticket, status: 'used' };

    // Mirror the check-in on the blockchain (best effort, in the background so the gate scan stays fast)
    contract
      .validateTicket(updated.onchain_ticket_id)
      .then((tx) => tx.wait())
      .then(() => console.log(`Ticket ${updated.onchain_ticket_id} marked Used on-chain`))
      .catch((err) => console.error('On-chain validateTicket failed:', err.reason || err.message));

    res.json({ message: 'Ticket checked in successfully!', ticket: updated });
  } catch (error) {
    console.error('[POST /tickets/check-in]', error.message);
    res.status(500).json({ error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});