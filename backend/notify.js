// notify.js
// Small helper that records an in-app notification for a user.
// It never throws: a failed notification must not break a purchase or a check-in.

const supabase = require('./supabaseClient');

async function notify(userId, { type, title, message, dedupeKey = null }) {
  if (!userId) return;
  try {
    const { error } = await supabase.from('notifications').insert({
      user_id: userId,
      type,
      title,
      message,
      dedupe_key: dedupeKey,
    });
    // 23505 = this automated notification was already sent (dedupe_key is unique)
    if (error && error.code !== '23505') {
      console.error('[notify]', error.message);
    }
  } catch (err) {
    console.error('[notify]', err.message);
  }
}

module.exports = { notify };