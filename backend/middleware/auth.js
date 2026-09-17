// middleware/auth.js
// Verifies the Supabase Auth access_token sent by the client, then looks up
// the user's role from public.users. Drop into backend/middleware/auth.js

const supabase = require('../supabaseClient'); // must use the SERVICE ROLE key

/**
 * requireAuth
 * Expects: Authorization: Bearer <supabase access_token>
 * (the client gets this token back from supabase.auth.signInWithPassword())
 */
async function requireAuth(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;

  if (!token) {
    return res.status(401).json({ error: 'Missing or malformed Authorization header.' });
  }

  // Ask Supabase Auth itself to validate the token — no need to verify JWTs by hand.
  const { data: { user }, error } = await supabase.auth.getUser(token);

  if (error || !user) {
    return res.status(401).json({ error: 'Invalid or expired token.' });
  }

  // Pull the role from your own profile table.
  const { data: profile, error: profileError } = await supabase
    .from('users')
    .select('id, full_name, email, role')
    .eq('id', user.id)
    .single();

  if (profileError || !profile) {
    return res.status(403).json({ error: 'No profile found for this account.' });
  }

  req.user = profile; // { id, full_name, email, role }
  return next();
}

/**
 * requireRole(...allowedRoles)
 * Chain after requireAuth.
 * Example: app.post('/api/tickets/check-in', requireAuth, requireRole('staff','admin'), handler)
 */
function requireRole(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Not authenticated.' });
    }
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        error: `Forbidden — this action requires one of: ${allowedRoles.join(', ')}.`,
      });
    }
    return next();
  };
}

module.exports = { requireAuth, requireRole };