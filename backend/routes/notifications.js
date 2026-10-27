// routes/notifications.js
// Automated Notifications (Requirement h), shown inside the platform.
//
//   GET  /api/notifications            my latest notifications + unread count
//   POST /api/notifications/read-all   mark all of mine as read
//   POST /api/notifications/broadcast  organizer/admin: announcement to all ticket holders of an event

const express = require('express');
const supabase = require('../supabaseClient');
const { requireAuth, requireRole } = require('../middleware/auth');

const router = express.Router();

router.get('/', requireAuth, async (req, res) => {
  try {
    const [list, unread] = await Promise.all([
      supabase
        .from('notifications')
        .select('id, type, title, message, read_at, created_at')
        .eq('user_id', req.user.id)
        .order('created_at', { ascending: false })
        .limit(30),
      supabase
        .from('notifications')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', req.user.id)
        .is('read_at', null),
    ]);
    if (list.error) throw list.error;
    if (unread.error) throw unread.error;

    res.json({ notifications: list.data, unreadCount: unread.count || 0 });
  } catch (error) {
    console.error('[GET /notifications]', error.message);
    res.status(500).json({ error: error.message });
  }
});

router.post('/read-all', requireAuth, async (req, res) => {
  try {
    const { error } = await supabase
      .from('notifications')
      .update({ read_at: new Date().toISOString() })
      .eq('user_id', req.user.id)
      .is('read_at', null);
    if (error) throw error;
    res.json({ ok: true });
  } catch (error) {
    console.error('[POST /notifications/read-all]', error.message);
    res.status(500).json({ error: error.message });
  }
});

router.post('/broadcast', requireAuth, requireRole('organizer', 'admin'), async (req, res) => {
  try {
    const { eventId, title, message } = req.body || {};
    const cleanTitle = typeof title === 'string' ? title.trim() : '';
    const cleanMessage = typeof message === 'string' ? message.trim() : '';

    if (!eventId) return res.status(400).json({ error: 'eventId is required' });
    if (!cleanTitle || cleanTitle.length > 120) {
      return res.status(400).json({ error: 'A title (up to 120 characters) is required' });
    }
    if (!cleanMessage || cleanMessage.length > 500) {
      return res.status(400).json({ error: 'A message (up to 500 characters) is required' });
    }

    const { data: tickets, error } = await supabase
      .from('tickets')
      .select('owner_id')
      .eq('event_id', eventId)
      .eq('status', 'sold');
    if (error) throw error;

    const owners = [...new Set((tickets || []).map((t) => t.owner_id).filter(Boolean))];
    if (owners.length > 0) {
      const rows = owners.map((userId) => ({
        user_id: userId,
        type: 'schedule_update',
        title: cleanTitle,
        message: cleanMessage,
      }));
      const { error: insertError } = await supabase.from('notifications').insert(rows);
      if (insertError) throw insertError;
    }

    res.json({ sent: owners.length });
  } catch (error) {
    console.error('[POST /notifications/broadcast]', error.message);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;