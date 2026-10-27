import React, { useEffect, useState } from 'react';
import {
  Alert, Button, Dialog, DialogActions, DialogContent, DialogTitle, MenuItem, TextField,
} from '@mui/material';
import CampaignIcon from '@mui/icons-material/Campaign';
import { useAuth } from '../../contexts/AuthContext';

const API = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';
const SENDER_ROLES = ['organizer', 'admin'];

interface EventOption {
  id: string;
  name: string;
}

const AnnouncementButton: React.FC = () => {
  const { user, accessToken } = useAuth();
  const [open, setOpen] = useState(false);
  const [events, setEvents] = useState<EventOption[]>([]);
  const [eventId, setEventId] = useState('');
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [feedback, setFeedback] = useState<{ kind: 'success' | 'error'; text: string } | null>(null);

  const allowed = !!user && SENDER_ROLES.includes(user.role);

  useEffect(() => {
    if (!open) return;
    setFeedback(null);
    fetch(`${API}/events`)
      .then((res) => res.json())
      .then((body) => {
        const list: EventOption[] = (body.events ?? []).map((e: any) => ({ id: e.id, name: e.name }));
        setEvents(list);
        setEventId((current) => current || list[0]?.id || '');
      })
      .catch(() => setFeedback({ kind: 'error', text: 'Could not load events.' }));
  }, [open]);

  if (!allowed) return null;

  const send = async () => {
    if (!accessToken) return;
    setSending(true);
    setFeedback(null);
    try {
      const res = await fetch(`${API}/notifications/broadcast`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${accessToken}` },
        body: JSON.stringify({ eventId, title, message }),
      });
      const body = await res.json().catch(() => ({}));
      if (res.status === 401) throw new Error('Your session expired. Please log out and log in again.');
      if (!res.ok) throw new Error(body.error || `Request failed (${res.status})`);
      setFeedback({ kind: 'success', text: `Announcement sent to ${body.sent} ticket holder(s).` });
      setTitle('');
      setMessage('');
    } catch (e: any) {
      setFeedback({ kind: 'error', text: e.message || 'Could not send the announcement' });
    } finally {
      setSending(false);
    }
  };

  return (
    <>
      <Button
        size="small"
        variant="contained"
        startIcon={<CampaignIcon />}
        onClick={() => setOpen(true)}
        sx={{ textTransform: 'none', fontWeight: 'bold', borderRadius: 2 }}
      >
        Send announcement
      </Button>
      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Announcement to ticket holders</DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 2 }}>
          {feedback && <Alert severity={feedback.kind}>{feedback.text}</Alert>}
          <TextField
            select
            label="Event"
            value={eventId}
            onChange={(e) => setEventId(e.target.value)}
            size="small"
            fullWidth
            sx={{ mt: 1 }}
          >
            {events.map((ev) => (
              <MenuItem key={ev.id} value={ev.id}>
                {ev.name}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            label="Title (e.g. Schedule update)"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            size="small"
            fullWidth
            inputProps={{ maxLength: 120 }}
          />
          <TextField
            label="Message"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            size="small"
            fullWidth
            multiline
            minRows={3}
            inputProps={{ maxLength: 500 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Close</Button>
          <Button
            variant="contained"
            onClick={send}
            disabled={sending || !eventId || !title.trim() || !message.trim()}
          >
            {sending ? 'Sending...' : 'Send'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default AnnouncementButton;