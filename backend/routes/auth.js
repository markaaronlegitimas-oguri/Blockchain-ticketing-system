// routes/auth.js
// Thin wrapper around Supabase Auth for register/login, plus a role-promotion
// endpoint. Drop into backend/routes/auth.js

const express = require('express');
const supabase = require('../supabaseClient'); // SERVICE ROLE key client
const { requireAuth, requireRole } = require('../middleware/auth');

const router = express.Router();

// POST /api/auth/register
// Creates a Supabase Auth account. The DB trigger (see
// sql/auto_create_profile_trigger.sql) automatically creates the matching
// public.users row with role = 'attendee'.
router.post('/register', async (req, res) => {
  try {
    const { full_name, email, password } = req.body;

    if (!full_name || !email || !password) {
      return res.status(400).json({ error: 'full_name, email, and password are required.' });
    }
    if (password.length < 8) {
      return res.status(400).json({ error: 'Password must be at least 8 characters.' });
    }

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name } }, // lands in raw_user_meta_data, read by the trigger
    });

    if (error) return res.status(400).json({ error: error.message });

    // If email confirmation is ON in your Supabase Auth settings, session will
    // be null here until the user clicks the confirmation link.
    return res.status(201).json({
      user: data.user,
      session: data.session, // contains access_token if email confirmation is OFF
    });
  } catch (err) {
    console.error('[auth/register]', err.message);
    return res.status(500).json({ error: 'Registration failed. Please try again.' });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'email and password are required.' });
    }

    const { data, error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) return res.status(401).json({ error: 'Invalid email or password.' });

        const { data: profile, error: profileError } = await supabase
      .from('users')
      .select('id, full_name, email, role')
      .eq('id', data.user.id)
      .single();

    console.log('DEBUG login - user id:', data.user.id);
    console.log('DEBUG login - profile:', profile);
    console.log('DEBUG login - profileError:', profileError);

    return res.json({
      user: profile,
      access_token: data.session.access_token, // send this as "Bearer <token>" on future requests
      refresh_token: data.session.refresh_token,
    });
  } catch (err) {
    console.error('[auth/login]', err.message);
    return res.status(500).json({ error: 'Login failed. Please try again.' });
  }
});

// GET /api/auth/me
router.get('/me', requireAuth, async (req, res) => {
  return res.json({ user: req.user });
});

// PATCH /api/auth/users/:id/role  — admin-only
router.patch('/users/:id/role', requireAuth, requireRole('admin'), async (req, res) => {
  const { role } = req.body;
  const validRoles = ['attendee', 'staff', 'organizer', 'admin'];

  if (!validRoles.includes(role)) {
    return res.status(400).json({ error: `role must be one of: ${validRoles.join(', ')}` });
  }

  const { data, error } = await supabase
    .from('users')
    .update({ role })
    .eq('id', req.params.id)
    .select('id, full_name, email, role')
    .single();

  if (error) return res.status(500).json({ error: 'Could not update role.' });
  return res.json({ user: data });
});

module.exports = router;