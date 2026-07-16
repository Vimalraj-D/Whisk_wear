const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function check() {
  console.log('Querying Supabase users table...');
  try {
    const { data: users, error } = await supabase
      .from('users')
      .select('id, name, email, password, is_verified, verification_code, created_at');
      
    if (error) throw error;
    
    console.log('Total registered users:', users.length);
    console.table(users);
  } catch (err) {
    console.error('Error querying database:', err.message);
  }
}

check();
