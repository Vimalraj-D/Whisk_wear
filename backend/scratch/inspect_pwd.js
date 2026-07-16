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
const SUPABASE_SERVICE_ROLE_KEY = envConfig.SUPABASE_SERVICE_ROLE_KEY;

async function check() {
  const url = `${SUPABASE_URL}/rest/v1/users?email=eq.vimalrajnov17@gmail.com&select=id,name,email,password`;
  
  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'apikey': SUPABASE_SERVICE_ROLE_KEY,
        'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
        'Content-Type': 'application/json'
      }
    });
    
    const data = await response.json();
    if (data.length > 0) {
      const pwd = data[0].password;
      console.log('Password is:', JSON.stringify(pwd));
      console.log('Password length:', pwd.length);
      console.log('Character codes:', pwd.split('').map(c => c.charCodeAt(0)));
    } else {
      console.log('User not found');
    }
  } catch (err) {
    console.error('Error:', err.message);
  }
}

check();
