// routes/tickets.js
// Verifies an on-chain purchase and records it in Supabase.

const express = require('express');
const { ethers } = require('ethers'); // backend uses ethers v6
const supabase = require('../supabaseClient');
const { requireAuth } = require('../middleware/auth');
const contractArtifact = require('../EventTicket.json');

const router = express.Router();

const CONTRACT_ADDRESS = process.env.CONTRACT_ADDRESS;
const provider = new ethers.JsonRpcProvider(process.env.SEPOLIA_RPC_URL);
const iface = new ethers.Interface(contractArtifact.abi);

const sameAddress = (a, b) =>
  !!a && !!b && a.toLowerCase() === b.toLowerCase();

// POST /api/tickets/verify-purchase
// body: { txHash, bookingId }
router.post('/verify-purchase', requireAuth, async (req, res) => {
  const { txHash, bookingId } = req.body;
  const userId = req.user.id;

  if (!txHash || !/^0x[a-fA-F0-9]{64}$/.test(txHash)) {
    return res.status(400).json({ error: 'A valid txHash is required' });
  }
  if (!bookingId) {
    return res.status(400).json({ error: 'bookingId is required' });
  }

  try {
    // 1. The user's linked wallet
    const { data: userRow, error: userError } = await supabase
      .from('users')
      .select('wallet_address')
      .eq('id', userId)
      .single();
    if (userError || !userRow?.wallet_address) {
      return res.status(400).json({ error: 'No wallet linked to this account. Connect your wallet first.' });
    }

    // 2. The booking, and the slot -> session -> event it belongs to
    const { data: booking, error: bookingError } = await supabase
      .from('bookings')
      .select('id, user_id, slot_id, status, expires_at')
      .eq('id', bookingId)
      .single();
    if (bookingError || !booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }
    if (booking.user_id !== userId) {
      return res.status(403).json({ error: 'This booking does not belong to you' });
    }

    const { data: slot, error: slotError } = await supabase
      .from('slots')
      .select('id, session_id')
      .eq('id', booking.slot_id)
      .single();
    if (slotError || !slot) throw slotError || new Error('Slot not found');

    const { data: session, error: sessionError } = await supabase
      .from('sessions')
      .select('id, event_id')
      .eq('id', slot.session_id)
      .single();
    if (sessionError || !session) throw sessionError || new Error('Session not found');

    // 3. The transaction on Sepolia
    const receipt = await provider.getTransactionReceipt(txHash);
    if (!receipt) {
      return res.status(404).json({ error: 'Transaction not found or not yet mined. Try again shortly.' });
    }
    if (receipt.status !== 1) {
      return res.status(400).json({ error: 'Transaction failed on-chain' });
    }
    if (!sameAddress(receipt.to, CONTRACT_ADDRESS)) {
      return res.status(400).json({ error: 'Transaction was not sent to the ticket contract' });
    }

    // 4. Find the TicketPurchased event emitted by our contract
    let purchased = null;
    for (const log of receipt.logs) {
      if (!sameAddress(log.address, CONTRACT_ADDRESS)) continue;
      try {
        const parsed = iface.parseLog({ topics: [...log.topics], data: log.data });
        if (parsed && parsed.name === 'TicketPurchased') {
          purchased = parsed;
          break;
        }
      } catch (_) {
        // not an event from our ABI, skip
      }
    }
    if (!purchased) {
      return res.status(400).json({ error: 'No TicketPurchased event in this transaction' });
    }

    const onchainTicketId = Number(purchased.args.ticketId);
    const buyer = purchased.args.buyer;

    // 5. The buyer must be this user's linked wallet (case-insensitive)
    if (!sameAddress(buyer, userRow.wallet_address)) {
      return res.status(403).json({ error: 'The buyer wallet does not match your linked wallet' });
    }

    // 6. Already recorded? Return it (safe to retry).
    const { data: existing } = await supabase
      .from('tickets')
      .select('*')
      .eq('event_id', session.event_id)
      .eq('onchain_ticket_id', onchainTicketId)
      .maybeSingle();

    if (existing) {
      if (existing.owner_id === userId) {
        return res.json({ message: 'Ticket already recorded', ticket: existing });
      }
      return res.status(409).json({ error: 'This on-chain ticket is already recorded for another user' });
    }

    // 7. Booking must still be pending and unexpired
    if (booking.status !== 'pending') {
      return res.status(409).json({ error: `Booking is already ${booking.status}` });
    }
    if (new Date(booking.expires_at) < new Date()) {
      return res.status(409).json({ error: 'Booking expired before the purchase was verified' });
    }

    // 8. Record the ticket (same qr_code format the check-in flow expects)
    const qrCode = `TICKET-${onchainTicketId}-${userId}-${Date.now()}`;
    const { data: ticket, error: insertError } = await supabase
      .from('tickets')
      .insert({
        onchain_ticket_id: onchainTicketId,
        event_id: session.event_id,
        session_id: session.id,
        owner_id: userId,
        status: 'sold',
        qr_code: qrCode,
      })
      .select()
      .single();

    if (insertError) {
      if (insertError.code === '23505') {
        return res.status(409).json({ error: 'This ticket was already recorded' });
      }
      throw insertError;
    }

    res.status(201).json({ message: 'Purchase verified', ticket });
  } catch (error) {
    console.error('[POST /verify-purchase]', error.message);
    res.status(500).json({ error: error.message });
  }
});

router.post('/sync-transfer', requireAuth, async (req, res) => {
  try {
    const { txHash } = req.body || {};
    if (!/^0x[0-9a-fA-F]{64}$/.test(txHash || '')) {
      return res.status(400).json({ error: 'A valid txHash is required' });
    }

    const receipt = await provider.getTransactionReceipt(txHash);
    if (!receipt) {
      return res.status(404).json({ error: 'Transaction not found yet, retry in a few seconds' });
    }
    if (receipt.status !== 1) {
      return res.status(400).json({ error: 'Transaction failed on-chain' });
    }

    let parsed = null;
    for (const log of receipt.logs) {
      if (log.address.toLowerCase() !== CONTRACT_ADDRESS.toLowerCase()) continue;
      try {
        const p = iface.parseLog({ topics: [...log.topics], data: log.data });
        if (p && p.name === 'TicketTransferred') { parsed = p; break; }
      } catch (_) {}
    }
    if (!parsed) {
      return res.status(400).json({ error: 'No TicketTransferred event found' });
    }

    const pick = (name, idx) => {
      try { return parsed.args.getValue(name); } catch (_) { return parsed.args[idx]; }
    };
    const onchainTicketId = pick('ticketId', 0).toString();
    const newOwnerWallet = pick('to', 2);

    const { data: ev } = await supabase
      .from('events').select('id')
      .ilike('contract_address', CONTRACT_ADDRESS).maybeSingle();
    if (!ev) {
      return res.status(500).json({ error: 'events.contract_address is not set' });
    }

    const { data: ticket } = await supabase
      .from('tickets').select('id, owner_id, last_transfer_block')
      .eq('event_id', ev.id).eq('onchain_ticket_id', onchainTicketId).maybeSingle();
    if (!ticket) {
      return res.status(404).json({ error: 'Ticket not found in database' });
    }

    if (ticket.last_transfer_block && receipt.blockNumber <= Number(ticket.last_transfer_block)) {
      return res.json({ synced: true, note: 'Already up to date' });
    }

    const { data: newUser } = await supabase
      .from('users').select('id')
      .ilike('wallet_address', newOwnerWallet).maybeSingle();
    if (!newUser) {
      return res.status(202).json({
        synced: false,
        reason: 'Recipient wallet is not linked to an account yet.',
      });
    }

    const newQr = `TICKET-${onchainTicketId}-${newUser.id}-${Date.now()}`;
    const { error: updErr } = await supabase
      .from('tickets')
      .update({
        owner_id: newUser.id,
        qr_code: newQr,
        last_transfer_tx: txHash,
        last_transfer_block: receipt.blockNumber,
      })
      .eq('id', ticket.id);
    if (updErr) throw updErr;

    return res.json({ synced: true, ticketId: ticket.id, newOwnerId: newUser.id });
  } catch (err) {
    console.error('sync-transfer error:', err);
    return res.status(500).json({ error: 'Failed to sync transfer' });
  }
});

// GET /api/tickets/my-tickets
// Returns event name + session date for each ticket the logged-in user owns in Supabase,
// keyed by onchain_ticket_id so the frontend can merge it with contract data.
router.get('/my-tickets', requireAuth, async (req, res) => {
  const userId = req.user.id;

  try {
    const { data, error } = await supabase
      .from('tickets')
      .select(`
        onchain_ticket_id,
        sessions ( session_name, starts_at, events ( name ) )
      `)
      .eq('owner_id', userId);

    if (error) throw error;

    const tickets = (data || []).map((row) => ({
      onchainTicketId: row.onchain_ticket_id,
      eventName: row.sessions?.events?.name ?? null,
      sessionDate: row.sessions?.starts_at ?? null,
    }));

    res.json({ tickets });
  } catch (error) {
    console.error('[GET /my-tickets]', error.message);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;    