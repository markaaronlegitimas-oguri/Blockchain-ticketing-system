import React, { useEffect, useState } from 'react';
import {
  Alert, Box, Button, CircularProgress, Dialog, DialogActions, DialogContent, DialogTitle, Typography,
} from '@mui/material';
import { useAuth } from '../../contexts/AuthContext';

const API = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';

interface TicketQrDialogProps {
  open: boolean;
  onClose: () => void;
  ticketId: number;
  eventName?: string;
}

const TicketQrDialog: React.FC<TicketQrDialogProps> = ({ open, onClose, ticketId, eventName }) => {
  const { accessToken } = useAuth();
  const [qrImage, setQrImage] = useState<string | null>(null);
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open) return;
    setQrImage(null);
    setQrCode(null);
    setError(null);

    if (!accessToken) {
      setError('Please log in to show your ticket QR code.');
      return;
    }

    setLoading(true);
    fetch(`${API}/tickets/my-tickets/${ticketId}/qr`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    })
      .then(async (res) => {
        const body = await res.json().catch(() => ({}));
        if (res.status === 401) throw new Error('Your session expired. Please log out and log in again.');
        if (!res.ok) throw new Error(body.error || `Request failed (${res.status})`);
        setQrImage(body.qrImage);
        setQrCode(body.qrCode);
      })
      .catch((e: any) => setError(e.message || 'Could not load the QR code'))
      .finally(() => setLoading(false));
  }, [open, ticketId, accessToken]);

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="xs"
      fullWidth
      onClick={(e) => e.stopPropagation()} // keep clicks from reaching the ticket card behind
    >
      <DialogTitle>{eventName ?? `Ticket #${ticketId}`} · Entry QR</DialogTitle>
      <DialogContent sx={{ textAlign: 'center' }}>
        {loading && <CircularProgress sx={{ my: 4 }} />}
        {error && <Alert severity="error">{error}</Alert>}
        {qrImage && (
          <Box>
            <Box component="img" src={qrImage} alt="Ticket QR code" sx={{ width: '100%', maxWidth: 320 }} />
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
              Show this code to the staff at the gate. It works once.
            </Typography>
            {qrCode && (
              <Typography variant="caption" sx={{ wordBreak: 'break-all', display: 'block' }}>
                {qrCode}
              </Typography>
            )}
          </Box>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
};

export default TicketQrDialog;