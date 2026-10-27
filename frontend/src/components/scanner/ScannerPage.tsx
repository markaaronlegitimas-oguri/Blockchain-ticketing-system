import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Alert, Box, Button, Divider, Paper, TextField, Typography } from '@mui/material';
import { Html5Qrcode } from 'html5-qrcode';
import { useAuth } from '../../contexts/AuthContext';

const API = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';
const READER_ID = 'qr-reader';
const CHECKIN_ROLES = ['staff', 'admin'];

interface ScanResult {
  kind: 'success' | 'error';
  message: string;
}

const ScannerPage: React.FC = () => {
  const { user, accessToken, isAuthenticated } = useAuth();
  const [result, setResult] = useState<ScanResult | null>(null);
  const [manualCode, setManualCode] = useState('');
  const [busy, setBusy] = useState(false);
  const [cameraOn, setCameraOn] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);

  const scannerRef = useRef<Html5Qrcode | null>(null);
  const lastScanRef = useRef<{ code: string; at: number } | null>(null);

  const allowed = !!user && CHECKIN_ROLES.includes(user.role);

  const checkIn = useCallback(
    async (code: string) => {
      if (!accessToken || !code.trim()) return;
      setBusy(true);
      try {
        const res = await fetch(`${API}/tickets/check-in`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${accessToken}` },
          body: JSON.stringify({ qrCode: code.trim() }),
        });
        const body = await res.json().catch(() => ({}));

        if (res.ok) {
          const num = body.ticket?.onchain_ticket_id;
          setResult({ kind: 'success', message: `ENTRY APPROVED — Ticket #${num ?? ''} checked in.` });
        } else if (res.status === 401) {
          setResult({ kind: 'error', message: 'Your session expired. Please log out and log in again.' });
        } else if (res.status === 403) {
          setResult({ kind: 'error', message: 'Your account is not allowed to check in tickets.' });
        } else if (res.status === 409) {
          setResult({ kind: 'error', message: `ENTRY DENIED — ${body.error || 'Ticket already used.'}` });
        } else if (res.status === 404) {
          setResult({ kind: 'error', message: 'ENTRY DENIED — Ticket not found or QR code is no longer valid.' });
        } else {
          setResult({ kind: 'error', message: body.error || `Request failed (${res.status})` });
        }
      } catch (e: any) {
        setResult({ kind: 'error', message: e.message || 'Could not reach the server' });
      } finally {
        setBusy(false);
      }
    },
    [accessToken]
  );

  // The camera callback lives across renders, so always call the latest checkIn.
  const checkInRef = useRef(checkIn);
  useEffect(() => {
    checkInRef.current = checkIn;
  }, [checkIn]);

  const handleDecoded = useCallback((text: string) => {
    const now = Date.now();
    const last = lastScanRef.current;
    // The camera sees the same QR many times per second; ignore repeats for 4 seconds.
    if (last && last.code === text && now - last.at < 4000) return;
    lastScanRef.current = { code: text, at: now };
    checkInRef.current(text);
  }, []);

  const stopCamera = useCallback(async () => {
    const scanner = scannerRef.current;
    scannerRef.current = null;
    if (scanner) {
      try {
        await scanner.stop();
        scanner.clear();
      } catch {
        // already stopped
      }
    }
    setCameraOn(false);
  }, []);

  const startCamera = async () => {
    setCameraError(null);
    try {
      const scanner = new Html5Qrcode(READER_ID);
      scannerRef.current = scanner;
      await scanner.start(
        { facingMode: 'environment' },
        { fps: 10, qrbox: { width: 240, height: 240 } },
        handleDecoded,
        undefined
      );
      setCameraOn(true);
    } catch (e: any) {
      scannerRef.current = null;
      setCameraError(
        typeof e === 'string' ? e : e?.message || 'Could not start the camera. Allow camera access and try again.'
      );
    }
  };

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, [stopCamera]);

  if (!isAuthenticated) {
    return <Alert severity="info">Please log in as staff to scan tickets.</Alert>;
  }
  if (!allowed) {
    return (
      <Alert severity="warning">
        The ticket scanner is only available to staff and admin accounts.
      </Alert>
    );
  }

  return (
    <Box sx={{ maxWidth: 520, mx: 'auto' }}>
      <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
        Gate Check-in
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Scan the attendee&apos;s ticket QR code. Each ticket can be used once.
      </Typography>

      {result && (
        <Alert
          severity={result.kind}
          variant="filled"
          sx={{ mb: 3, fontSize: '1.1rem', fontWeight: 600 }}
          onClose={() => setResult(null)}
        >
          {result.message}
        </Alert>
      )}

      <Paper variant="outlined" sx={{ p: 2, borderRadius: 2, mb: 3 }}>
        <Box id={READER_ID} sx={{ width: '100%', display: cameraOn ? 'block' : 'none', mb: 2 }} />
        {cameraError && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {cameraError}
          </Alert>
        )}
        {cameraOn ? (
          <Button fullWidth variant="outlined" color="error" onClick={stopCamera}>
            Stop camera
          </Button>
        ) : (
          <Button fullWidth variant="contained" onClick={startCamera}>
            Start camera scanner
          </Button>
        )}
      </Paper>

      <Divider sx={{ mb: 3 }}>or enter the code manually</Divider>

      <Box sx={{ display: 'flex', gap: 1 }}>
        <TextField
          fullWidth
          size="small"
          label="Ticket QR code text"
          value={manualCode}
          onChange={(e) => setManualCode(e.target.value)}
        />
        <Button
          variant="contained"
          disabled={busy || !manualCode.trim()}
          onClick={() => checkIn(manualCode)}
        >
          Check in
        </Button>
      </Box>
    </Box>
  );
};

export default ScannerPage;