const fs = require('fs');
const path = require('path');

// Manually parse .env file
const envPath = path.resolve(__dirname, '../.env');
const envConfig = {};
try {
  const envContent = fs.readFileSync(envPath, 'utf-8');
  envContent.split('\n').forEach(line => {
    const parts = line.split('=');
    if (parts.length >= 2) {
      const key = parts[0].trim();
      const val = parts.slice(1).join('=').trim();
      envConfig[key] = val;
    }
  });
} catch (e) {
  console.error('Failed to read .env file:', e.message);
}

const SUPABASE_URL = envConfig.SUPABASE_URL;
const SUPABASE_ANON_KEY = envConfig.SUPABASE_ANON_KEY;

async function test() {
  const email = 'vimalrajnov17@gmail.com';
  
  // Use the ANON key
  const url = `${SUPABASE_URL}/rest/v1/users?email=eq.${email.toLowerCase()}&select=id,name,email,password,is_verified`;
  
  try {
    console.log('Querying with ANON key...');
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json'
      }
    });
    
    const data = await response.json();
    console.log('Query result with ANON key:', data);
  } catch (err) {
    console.error('Error:', err.message);
  }
}

test();
