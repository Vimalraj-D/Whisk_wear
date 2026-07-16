async function test() {
  const url = 'https://whisk-wear.onrender.com/api/auth/user/login';
  
  try {
    console.log(`Testing login on Render: ${url}`);
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: 'vimalrajnov17@gmail.com',
        password: 'Vimalnov17@'
      })
    });
    
    console.log(`Status: ${response.status}`);
    console.log(`Response text: ${await response.text()}`);
  } catch (err) {
    console.error('Error:', err.message);
  }
}

test();
