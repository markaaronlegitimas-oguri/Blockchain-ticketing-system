// routes/events.js
const express = require('express');
const supabase = require('../supabaseClient');

const router = express.Router();

// GET /api/events
router.get('/', async (req, res) => {
  try {
    const { data: events, error } = await supabase.from('events').select('*');
    if (error) throw error;
    res.json({ events });
  } catch (error) {
    console.error('[GET /events]', error.message);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;