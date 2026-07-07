const http = require('http');
const supabase = require('./config/supabase');

const API_BASE = 'http://localhost:5000/api';

const makeRequest = (method, path, body = null, headers = {}) => {
  return new Promise((resolve, reject) => {
    const url = `${API_BASE}${path}`;
    const options = {
      method: method,
      headers: {
        'Content-Type': 'application/json',
        ...headers
      }
    };

    const req = http.request(url, options, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        try {
          const parsed = data ? JSON.parse(data) : {};
          resolve({
            statusCode: res.statusCode,
            data: parsed
          });
        } catch (e) {
          resolve({
            statusCode: res.statusCode,
            raw: data
          });
        }
      });
    });

    req.on('error', (err) => {
      reject(err);
    });

    if (body) {
      req.write(JSON.stringify(body));
    }
    req.end();
  });
};

async function runTests() {
  console.log('🚀 Starting Whiskwear Route & User Auth Integration Tests...\n');
  let passed = 0;
  let failed = 0;

  // Test 1: Health Check
  try {
    console.log('Test 1: GET /api/health');
    const res = await makeRequest('GET', '/health');
    if (res.statusCode === 200 && res.data.status === 'OK') {
      console.log('✅ Passed - Health Check returned 200 OK');
      passed++;
    } else {
      console.log(`❌ Failed - Health Check returned status ${res.statusCode}`, res.data);
      failed++;
    }
  } catch (err) {
    console.log('❌ Failed - Health Check request failed', err.message);
    failed++;
  }

  // Test 2: Admin Login
  let adminToken = '';
  try {
    console.log('\nTest 2: POST /api/auth/admin/login');
    const res = await makeRequest('POST', '/auth/admin/login', { username: 'admin', password: 'whiskwear2026' });
    if (res.statusCode === 200 && res.data.success && res.data.token) {
      adminToken = res.data.token;
      console.log('✅ Passed - Admin logged in and token received');
      passed++;
    } else {
      console.log(`❌ Failed - Admin login returned status ${res.statusCode}`, res.data);
      failed++;
    }
  } catch (err) {
    console.log('❌ Failed - Admin login failed', err.message);
    failed++;
  }

  // Test 3: User Signup Initiate (Step 1)
  const randomEmail = `testuser_${Math.floor(Math.random() * 1000000)}@whiskwear.com`;
  let otpCode = '';
  
  try {
    console.log(`\nTest 3: POST /api/auth/user/initiate (${randomEmail})`);
    const res = await makeRequest('POST', '/auth/user/initiate', {
      name: 'Test Customer',
      email: randomEmail
    });
    
    if (res.statusCode === 200 && res.data.success) {
      console.log(`✅ Passed - Customer initiate request successful: ${res.data.message}`);
      passed++;

      // Fetch the OTP code directly from the DB using the Supabase client
      console.log('Fetching OTP code from database...');
      const { data: dbUser, error: dbErr } = await supabase
        .from('users')
        .select('verification_code')
        .eq('email', randomEmail)
        .maybeSingle();

      if (dbErr) {
        console.error('❌ Database error fetching OTP code:', dbErr.message);
      } else if (dbUser && dbUser.verification_code) {
        otpCode = dbUser.verification_code;
        console.log(`✅ Retrieved OTP code from DB: ${otpCode}`);
      } else {
        console.log('❌ Failed to retrieve OTP code from DB.');
      }
    } else {
      console.log(`❌ Failed - User initiate returned status ${res.statusCode}`, res.data);
      failed++;
    }
  } catch (err) {
    console.log('❌ Failed - User initiate failed', err.message);
    failed++;
  }

  // Test 4: User Signup Verify (Step 2)
  let emailVerified = false;
  try {
    console.log('\nTest 4: POST /api/auth/user/verify');
    if (otpCode) {
      const res = await makeRequest('POST', '/auth/user/verify', {
        email: randomEmail,
        code: otpCode
      });
      if (res.statusCode === 200 && res.data.success) {
        emailVerified = true;
        console.log('✅ Passed - Customer verified successfully');
        passed++;
      } else {
        console.log(`❌ Failed - User verification returned status ${res.statusCode}`, res.data);
        failed++;
      }
    } else {
      console.log('⏭️ Skipped - OTP code not available, skipping verify test');
      failed++;
    }
  } catch (err) {
    console.log('❌ Failed - User verify request failed', err.message);
    failed++;
  }

  // Test 5: User Signup Complete (Step 3)
  let userToken = '';
  try {
    console.log('\nTest 5: POST /api/auth/user/complete');
    if (emailVerified) {
      const res = await makeRequest('POST', '/auth/user/complete', {
        email: randomEmail,
        password: 'Password123!'
      });
      if (res.statusCode === 200 && res.data.success && res.data.token) {
        userToken = res.data.token;
        console.log('✅ Passed - Customer password set and registration completed');
        passed++;
      } else {
        console.log(`❌ Failed - User complete returned status ${res.statusCode}`, res.data);
        failed++;
      }
    } else {
      console.log('⏭️ Skipped - Email not verified, skipping complete test');
      failed++;
    }
  } catch (err) {
    console.log('❌ Failed - User complete request failed', err.message);
    failed++;
  }

  // Test 6: User Login
  let loginToken = '';
  try {
    console.log('\nTest 6: POST /api/auth/user/login');
    if (userToken) {
      const res = await makeRequest('POST', '/auth/user/login', {
        email: randomEmail,
        password: 'Password123!'
      });
      if (res.statusCode === 200 && res.data.success && res.data.token) {
        loginToken = res.data.token;
        console.log('✅ Passed - Customer logged in successfully');
        passed++;
      } else {
        console.log(`❌ Failed - User login returned status ${res.statusCode}`, res.data);
        failed++;
      }
    } else {
      console.log('⏭️ Skipped - User signup complete failed, skipping login test');
      failed++;
    }
  } catch (err) {
    console.log('❌ Failed - User login failed', err.message);
    failed++;
  }

  // Test 7: Get User Orders History
  try {
    console.log('\nTest 7: GET /api/orders/my-orders');
    if (loginToken) {
      const res = await makeRequest('GET', '/orders/my-orders', null, {
        Authorization: `Bearer ${loginToken}`
      });
      if (res.statusCode === 200 && Array.isArray(res.data)) {
        console.log(`✅ Passed - Customer order history retrieved (found ${res.data.length} orders)`);
        passed++;
      } else {
        console.log(`❌ Failed - My-orders returned status ${res.statusCode}`, res.data);
        failed++;
      }
    } else {
      console.log('⏭️ Skipped - Login token not available, skipping history test');
      failed++;
    }
  } catch (err) {
    console.log('❌ Failed - My-orders fetch failed', err.message);
    failed++;
  }

  console.log('\n----------------------------------------');
  console.log(`Tests Run: ${passed + failed} | Passed: ${passed} | Failed: ${failed}`);
  console.log('----------------------------------------');

  if (failed > 0) {
    process.exit(1);
  }
}

setTimeout(() => {
  runTests().catch(err => {
    console.error('Unhandled error running tests:', err);
    process.exit(1);
  });
}, 500);
