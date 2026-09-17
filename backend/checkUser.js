require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);

async function main() {
  const { data, error } = await supabase
    .from('users')
    .select('role')
    .eq('id', '8bf7b0cc-b43d-4bcb-b249-7ddfc89d4cb3')
    .single();

  console.log('data:', data);
  console.log('error:', error);
}

main();