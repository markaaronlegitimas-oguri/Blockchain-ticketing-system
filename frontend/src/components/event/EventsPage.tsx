import React, { useEffect, useState, useCallback } from 'react';
import {
  Box, Typography, Card, CardContent, Button, Chip, Alert, Skeleton, Divider,
} from '@mui/material';
import { ethers } from 'ethers';
import { useAccount } from '../../contexts/AccountContext';
import { useAuth } from '../../contexts/AuthContext';
import { purchaseTicketOnChain } from '../../utils/purchaseTicket';

const API = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';

interface Slot {
  id: string;
  slot_name: string;
  price: number | string;
  capacity: number;
  available: number | null;
}
interface Session {
  id: string;
  session_name: string;
  starts_at: string;
  ends_at: string | null;
  slots: Slot[];
}
interface EventRow {
  id: string;
  name?: string;
  title?: string;
  description?: string;
  sessions: Session[];
}
interface Notice {
  severity: 'success' | 'error' | 'warning' | 'info';
  text: string;
}

async function api(path: string, options: RequestInit = {}, token?: string | null) {
  const res = await fetch(`${API}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    },
  });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) {
    const err: any = new Error(body.error || `Request failed (${res.status})`);
    err.status = res.status;
    throw err;
  }
  return body;
}

const EventsPage: React.FC = () => {
  const { contract, isConnected, connectWallet } = useAccount();
  const { isAuthenticated, accessToken } = useAuth();

  const [events, setEvents] = useState<EventRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [buyingSlotId, setBuyingSlotId] = useState<string | null>(null);
  const [notice, setNotice] = useState<Notice | null>(null);
  const [onchainPrice, setOnchainPrice] = useState<string | null>(null);

  const loadEvents = useCallback(async () => {
    try {
      setLoading(true);
      setLoadError(null);
      const { events: list } = await api('/events');
      const full: EventRow[] = await Promise.all(
        list.map(async (ev: any) => {
          const { sessions } = await api(`/events/${ev.id}/sessions`);
          const withSlots = await Promise.all(
            sessions.map(async (s: any) => {
              const { slots } = await api(`/sessions/${s.id}/slots`);
              return { ...s, slots };
            })
          );
          return { ...ev, sessions: withSlots };
        })
      );
      setEvents(full);
    } catch (e: any) {
      console.error('Error loading events:', e);
      setLoadError(e.message || 'Could not load events');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadEvents();
  }, [loadEvents]);

  // On-chain price is what the contract actually charges per ticket
  useEffect(() => {
    if (!contract) {
      setOnchainPrice(null);
      return;
    }
    contract
      .ticketPrice()
      .then((p: ethers.BigNumber) => setOnchainPrice(ethers.utils.formatEther(p)))
      .catch(() => setOnchainPrice(null));
  }, [contract]);

  const handleBuy = async (slot: Slot) => {
    setNotice(null);

    if (!isAuthenticated || !accessToken) {
      setNotice({ severity: 'warning', text: 'Please log in first (Login / Register at the top).' });
      return;
    }
    if (!isConnected || !contract) {
      setNotice({ severity: 'warning', text: 'Please connect your wallet (Sepolia) first.' });
      return;
    }

    let txHash: string | null = null;
    setBuyingSlotId(slot.id);
    try {
      // 1. Hold the slot
      const { booking } = await api(`/slots/${slot.id}/book`, { method: 'POST' }, accessToken);

      // 2. Pay on-chain via MetaMask
      const result = await purchaseTicketOnChain(contract);
      txHash = result.txHash;

      // 3. Backend verifies the transaction and records the ticket
      const { ticket } = await api(
        '/tickets/verify-purchase',
        { method: 'POST', body: JSON.stringify({ txHash, bookingId: booking.id }) },
        accessToken
      );

      // 4. Confirm the booking
      await api(
        `/bookings/${booking.id}/confirm`,
        { method: 'POST', body: JSON.stringify({ ticketId: ticket.id }) },
        accessToken
      );

      setNotice({ severity: 'success', text: 'Ticket purchased! See it under My Tickets.' });
      await loadEvents();
    } catch (e: any) {
      console.error('Purchase error:', e);
      if (e?.code === 4001 || e?.code === 'ACTION_REJECTED') {
        setNotice({ severity: 'info', text: 'Purchase cancelled in MetaMask.' });
      } else if (e?.status === 401) {
        setNotice({ severity: 'warning', text: 'Your session expired. Please log out, log in again, and retry.' });
      } else if (txHash) {
        setNotice({
          severity: 'error',
          text: `Payment went through (tx ${txHash}) but recording it failed: ${e.message}. Do not buy again; keep this transaction hash.`,
        });
      } else {
        setNotice({ severity: 'error', text: e.reason || e.message || 'Purchase failed' });
      }
    } finally {
      setBuyingSlotId(null);
    }
  };

  if (loading) {
    return (
      <Box>
        <Skeleton variant="rectangular" height={160} sx={{ borderRadius: 2, mb: 2 }} />
        <Skeleton variant="rectangular" height={160} sx={{ borderRadius: 2 }} />
      </Box>
    );
  }

  if (loadError) {
    return <Alert severity="error">Could not load events: {loadError}</Alert>;
  }

  return (
    <Box>
      <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 2 }}>
        Events
      </Typography>

      {notice && (
        <Alert severity={notice.severity} sx={{ mb: 2 }} onClose={() => setNotice(null)}>
          {notice.text}
        </Alert>
      )}

      {onchainPrice && (
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          On-chain ticket price: {onchainPrice} ETH (plus gas)
        </Typography>
      )}

      {events.length === 0 && (
        <Alert severity="info">No events available yet.</Alert>
      )}

      {events.map((ev) => (
        <Card key={ev.id} sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
              {ev.name ?? ev.title ?? 'Event'}
            </Typography>
            {ev.description && (
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                {ev.description}
              </Typography>
            )}

            {ev.sessions.length === 0 && (
              <Typography variant="body2" sx={{ mt: 1 }}>
                No sessions scheduled yet.
              </Typography>
            )}

            {ev.sessions.map((s) => (
              <Box key={s.id} sx={{ mt: 2 }}>
                <Divider sx={{ mb: 1.5 }} />
                <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                  {s.session_name}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                  {new Date(s.starts_at).toLocaleString()}
                </Typography>

                {s.slots.map((slot) => {
                  const soldOut = slot.available !== null && slot.available <= 0;
                  return (
                    <Box
                      key={slot.id}
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: 2,
                        py: 1,
                        flexWrap: 'wrap',
                      }}
                    >
                      <Box>
                        <Typography variant="body1">{slot.slot_name}</Typography>
                        <Typography variant="body2" color="text.secondary">
                          Price: {slot.price}
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <Chip
                          size="small"
                          color={soldOut ? 'error' : 'success'}
                          label={
                            slot.available === null
                              ? 'Availability unknown'
                              : soldOut
                              ? 'Sold out'
                              : `${slot.available} left`
                          }
                        />
                        <Button
                          variant="contained"
                          disabled={soldOut || buyingSlotId !== null}
                          onClick={() => handleBuy(slot)}
                        >
                          {buyingSlotId === slot.id ? 'Processing…' : 'Buy Ticket'}
                        </Button>
                      </Box>
                    </Box>
                  );
                })}
              </Box>
            ))}
          </CardContent>
        </Card>
      ))}

      {!isConnected && (
        <Box sx={{ mt: 2 }}>
          <Button variant="outlined" onClick={connectWallet}>
            Connect Wallet
          </Button>
        </Box>
      )}
    </Box>
  );
};

export default EventsPage;