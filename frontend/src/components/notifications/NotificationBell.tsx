import React, { useCallback, useEffect, useState } from 'react';
import { Badge, Box, Divider, IconButton, Popover, Typography } from '@mui/material';
import NotificationsIcon from '@mui/icons-material/Notifications';
import { useAuth } from '../../contexts/AuthContext';

const API = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';
const POLL_MS = 5000; // check for new notifications every 5 seconds

interface NotificationItem {
  id: string;
  type: string;
  title: string;
  message: string;
  read_at: string | null;
  created_at: string;
}

const NotificationBell: React.FC = () => {
  const { accessToken } = useAuth();
  const [items, setItems] = useState<NotificationItem[]>([]);
  const [unread, setUnread] = useState(0);
  const [fresh, setFresh] = useState<Set<string>>(new Set());
  const [anchor, setAnchor] = useState<HTMLElement | null>(null);

  const load = useCallback(async () => {
    if (!accessToken) return;
    try {
      const res = await fetch(`${API}/notifications`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      if (!res.ok) return;
      const body = await res.json();
      setItems(body.notifications ?? []);
      setUnread(body.unreadCount ?? 0);
    } catch {
      // ignore short network problems, we try again in 5 seconds
    }
  }, [accessToken]);

  useEffect(() => {
    load();
    const timer = setInterval(load, POLL_MS);
    return () => clearInterval(timer);
  }, [load]);

  const handleOpen = async (event: React.MouseEvent<HTMLElement>) => {
    setAnchor(event.currentTarget);
    // remember which ones were new so they stay highlighted while the list is open
    setFresh(new Set(items.filter((n) => !n.read_at).map((n) => n.id)));
    if (unread > 0 && accessToken) {
      try {
        await fetch(`${API}/notifications/read-all`, {
          method: 'POST',
          headers: { Authorization: `Bearer ${accessToken}` },
        });
        setUnread(0);
      } catch {
        // not critical
      }
    }
  };

  return (
    <>
      <IconButton onClick={handleOpen} aria-label="Notifications" size="small">
        <Badge badgeContent={unread} color="secondary" max={99}>
          <NotificationsIcon />
        </Badge>
      </IconButton>
      <Popover
        open={Boolean(anchor)}
        anchorEl={anchor}
        onClose={() => setAnchor(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Box sx={{ width: 360, maxWidth: '90vw', maxHeight: 420, overflowY: 'auto' }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 700, p: 2 }}>
            Notifications
          </Typography>
          <Divider />
          {items.length === 0 && (
            <Typography variant="body2" color="text.secondary" sx={{ p: 2 }}>
              No notifications yet.
            </Typography>
          )}
          {items.map((n) => (
            <Box
              key={n.id}
              sx={{
                p: 2,
                borderBottom: '1px solid',
                borderColor: 'divider',
                bgcolor: fresh.has(n.id) ? 'action.hover' : 'transparent',
              }}
            >
              <Typography variant="body2" sx={{ fontWeight: 700 }}>
                {n.title}
              </Typography>
              <Typography variant="body2">{n.message}</Typography>
              <Typography variant="caption" color="text.secondary">
                {new Date(n.created_at).toLocaleString()}
              </Typography>
            </Box>
          ))}
        </Box>
      </Popover>
    </>
  );
};

export default NotificationBell;