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
  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    console.error('Missing Supabase credentials in parsed configuration:', envConfig);
    return;
  }

  const url = `${SUPABASE_URL}/rest/v1/users?select=id,name,email,password,is_verified,verification_code,code_expires_at`;
  
  try {
    console.log(`Querying Supabase REST API: ${url}`);
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'apikey': SUPABASE_SERVICE_ROLE_KEY,
        'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status} - ${await response.text()}`);
    }
    
    const data = await response.json();
    console.log('Total registered users:', data.length);
    console.table(data);
  } catch (err) {
    console.error('Error querying Supabase REST API:', err.message);
  }
}

check();
