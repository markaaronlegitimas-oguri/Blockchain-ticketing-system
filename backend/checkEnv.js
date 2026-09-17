require('dotenv').config();
console.log('URL exists:', !!process.env.SUPABASE_URL);
console.log('KEY exists:', !!process.env.SUPABASE_SERVICE_KEY);
console.log('KEY length:', (process.env.SUPABASE_SERVICE_KEY || '').length);
