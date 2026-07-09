const { sendOrderConfirmationEmail } = require('./services/emailService');
require('dotenv').config();

const mockItems = [
  {
    name: 'Kids shirt',
    quantity: 1,
    price: 899.1,
    image_url: 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=200'
  }
];

async function run() {
  try {
    console.log('Sending mock order confirmation email...');
    const result = await sendOrderConfirmationEmail(
      process.env.SMTP_USER,
      'Test User',
      '9999',
      899.1,
      mockItems
    );
    console.log('Result:', result);
  } catch (err) {
    console.error('❌ Error sending order confirmation email:', err);
  }
}

run();
