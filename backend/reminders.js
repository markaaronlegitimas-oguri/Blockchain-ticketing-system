// reminders.js
// Automated event reminders: every minute, find sessions that start within the
// next 24 hours and remind each ticket holder once (dedupe_key keeps it to one).

const supabase = require('./supabaseClient');
const { notify } = require('./notify');

const REMINDER_WINDOW_HOURS = 24;
const CHECK_EVERY_MS = 60 * 1000;

async function runReminderPass() {
  try {
    const now = new Date();
    const until = new Date(now.getTime() + REMINDER_WINDOW_HOURS * 60 * 60 * 1000);

    const { data: sessions, error } = await supabase
      .from('sessions')
      .select('id, event_id, session_name, starts_at')
      .gt('starts_at', now.toISOString())
      .lte('starts_at', until.toISOString());
    if (error) throw error;

    for (const s of sessions || []) {
      const [{ data: tickets }, { data: event }] = await Promise.all([
        supabase.from('tickets').select('owner_id').eq('session_id', s.id).eq('status', 'sold'),
        supabase.from('events').select('name').eq('id', s.event_id).maybeSingle(),
      ]);

      const when = new Date(s.starts_at).toLocaleString('en-PH', {
        timeZone: 'Asia/Manila',
        dateStyle: 'medium',
        timeStyle: 'short',
      });
      const owners = [...new Set((tickets || []).map((t) => t.owner_id).filter(Boolean))];

      for (const ownerId of owners) {
        await notify(ownerId, {
          type: 'event_reminder',
          title: 'Event reminder',
          message: `${event?.name ?? 'Your event'} (${s.session_name}) starts ${when}. Have your ticket QR ready.`,
          dedupeKey: `reminder:${s.id}:${ownerId}`,
        });
      }
    }
  } catch (err) {
    console.error('[reminders]', err.message);
  }
}

function startReminderJob() {
  setTimeout(runReminderPass, 5000);
  setInterval(runReminderPass, CHECK_EVERY_MS);
}

module.exports = { startReminderJob, runReminderPass };