async function checkHealth() {
  const url = 'https://whisk-wear.onrender.com/api/health';
  try {
    const res = await fetch(url);
    console.log('Status:', res.status);
    console.log('Response:', await res.json());
  } catch (err) {
    console.error('Error:', err.message);
  }
}
checkHealth();
