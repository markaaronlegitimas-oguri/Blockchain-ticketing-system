import React, { useCallback, useEffect, useState } from 'react';
import { Alert, Box, Button, Chip, LinearProgress, Paper, Skeleton, Typography } from '@mui/material';
import DownloadIcon from '@mui/icons-material/Download';
import { useAuth } from '../../contexts/AuthContext';
  import AnnouncementButton from './AnnouncementButton';
  

const API = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';
const REFRESH_MS = 2000; // near real-time: refresh every 2 seconds

interface SlotStat {
  id: string;
  name: string;
  capacity: number;
  confirmed: number;
  pending: number;
  available: number;
}
interface SessionStat {
  id: string;
  name: string;
  startsAt: string;
  slots: SlotStat[];
}
interface EventStat {
  id: string;
  name: string;
  ticketPriceEth: number;
  sold: number;
  checkedIn: number;
  revenueEth: number;
  sessions: SessionStat[];
}
interface Summary {
  generatedAt: string;
  totals: {
    ticketsSold: number;
    checkedIn: number;
    revenueEth: number;
    activeHolds: number;
    checkInRate: number;
  };
  events: EventStat[];
}

type ReportKind = 'sales' | 'attendance';

const STAFF_ROLES = ['organizer', 'staff', 'admin'];

const StatCard: React.FC<{ label: string; value: string | number }> = ({ label, value }) => (
  <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
    <Typography variant="body2" color="text.secondary">
      {label}
    </Typography>
    <Typography variant="h4" sx={{ fontWeight: 700 }}>
      {value}
    </Typography>
  </Paper>
);

const DashboardPage: React.FC = () => {
  const { user, accessToken, isAuthenticated } = useAuth();
  const [data, setData] = useState<Summary | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [reportError, setReportError] = useState<string | null>(null);
  const [downloading, setDownloading] = useState<ReportKind | null>(null);

  const allowed = !!user && STAFF_ROLES.includes(user.role);

  const load = useCallback(async () => {
    if (!accessToken) return;
    try {
      const res = await fetch(`${API}/dashboard/summary`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      const body = await res.json().catch(() => ({}));
      if (res.status === 401) {
        throw new Error('Your session expired. Please log out and log in again.');
      }
      if (!res.ok) throw new Error(body.error || `Request failed (${res.status})`);
      setData(body);
      setError(null);
    } catch (e: any) {
      setError(e.message || 'Could not load dashboard');
    }
  }, [accessToken]);

  useEffect(() => {
    if (!allowed) return;
    load();
    const timer = setInterval(load, REFRESH_MS);
    return () => clearInterval(timer);
  }, [allowed, load]);

  // Reports need the Authorization header, so fetch the CSV and save it as a file.
  const downloadReport = async (kind: ReportKind) => {
    if (!accessToken) return;
    setDownloading(kind);
    setReportError(null);
    try {
      const res = await fetch(`${API}/reports/${kind}.csv`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        if (res.status === 401) {
          throw new Error('Your session expired. Please log out and log in again.');
        }
        throw new Error(body.error || `Request failed (${res.status})`);
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${kind}-report-${new Date().toISOString().slice(0, 10)}.csv`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
    } catch (e: any) {
      setReportError(e.message || 'Could not download the report');
    } finally {
      setDownloading(null);
    }
  };

  if (!isAuthenticated) {
    return <Alert severity="info">Please log in to view the dashboard.</Alert>;
  }
  if (!allowed) {
    return (
      <Alert severity="warning">
        The dashboard is only available to organizer, staff and admin accounts.
      </Alert>
    );
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3, flexWrap: 'wrap' }}>
        <Typography variant="h4" sx={{ fontWeight: 700 }}>
          Event Dashboard
        </Typography>
        <Chip
          size="small"
          color={error ? 'error' : 'success'}
          label={error ? 'Disconnected' : 'Live'}
        />
        {data && (
          <Typography variant="body2" color="text.secondary">
            Updated {new Date(data.generatedAt).toLocaleTimeString()}
          </Typography>
        )}
        <Box sx={{ ml: 'auto', display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                      <AnnouncementButton />
          <Button
            size="small"
            variant="outlined"
            startIcon={<DownloadIcon />}
            disabled={downloading !== null}
            onClick={() => downloadReport('sales')}
            sx={{ textTransform: 'none', fontWeight: 'bold', borderRadius: 2 }}
          >
            {downloading === 'sales' ? 'Preparing...' : 'Sales report (CSV)'}
          </Button>
          <Button
            size="small"
            variant="outlined"
            startIcon={<DownloadIcon />}
            disabled={downloading !== null}
            onClick={() => downloadReport('attendance')}
            sx={{ textTransform: 'none', fontWeight: 'bold', borderRadius: 2 }}
          >
            {downloading === 'attendance' ? 'Preparing...' : 'Attendance report (CSV)'}
          </Button>
        </Box>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      {reportError && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setReportError(null)}>
          {reportError}
        </Alert>
      )}

      {!data ? (
        <Skeleton variant="rectangular" height={120} sx={{ borderRadius: 2 }} />
      ) : (
        <>
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr 1fr', md: 'repeat(4, 1fr)' },
              gap: 2,
              mb: 4,
            }}
          >
            <StatCard label="Tickets sold" value={data.totals.ticketsSold} />
            <StatCard label="Checked in" value={`${data.totals.checkedIn} (${data.totals.checkInRate}%)`} />
            <StatCard label="Revenue (ETH)" value={data.totals.revenueEth} />
            <StatCard label="Active slot holds" value={data.totals.activeHolds} />
          </Box>

          {data.events.map((ev) => (
            <Paper key={ev.id} variant="outlined" sx={{ p: 3, mb: 3, borderRadius: 2 }}>
              <Typography variant="h5" sx={{ fontWeight: 600 }}>
                {ev.name}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                {ev.sold} sold · {ev.checkedIn} checked in · {ev.revenueEth} ETH
              </Typography>

              {ev.sessions.length === 0 && (
                <Typography variant="body2" color="text.secondary">
                  No sessions yet.
                </Typography>
              )}

              {ev.sessions.map((s) => (
                <Box key={s.id} sx={{ mb: 2 }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                    {s.name}{' '}
                    <Typography component="span" variant="body2" color="text.secondary">
                      {new Date(s.startsAt).toLocaleString()}
                    </Typography>
                  </Typography>
                  {s.slots.map((sl) => {
                    const used = sl.confirmed + sl.pending;
                    const pct = sl.capacity ? Math.min((used / sl.capacity) * 100, 100) : 0;
                    return (
                      <Box key={sl.id} sx={{ mt: 1 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                          <Typography variant="body2">{sl.name}</Typography>
                          <Typography variant="body2" color="text.secondary">
                            {sl.confirmed} sold · {sl.pending} held · {sl.available} left of {sl.capacity}
                          </Typography>
                        </Box>
                        <LinearProgress variant="determinate" value={pct} sx={{ height: 8, borderRadius: 4 }} />
                      </Box>
                    );
                  })}
                </Box>
              ))}
            </Paper>
          ))}
        </>
      )}
    </Box>
  );
};

export default DashboardPage;