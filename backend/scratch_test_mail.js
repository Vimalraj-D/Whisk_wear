const nodemailer = require('nodemailer');
require('dotenv').config();

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT) || 465,
  secure: true,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

async function run() {
  try {
    console.log('Sending test email...');
    const info = await transporter.sendMail({
      from: `"WhiskWear Test" <${process.env.SMTP_USER}>`,
      to: process.env.SMTP_USER,
      subject: 'Test Email from WhiskWear',
      text: 'If you receive this, SMTP is working perfectly!',
    });
    console.log('✅ Sent successfully! Message ID:', info.messageId);
  } catch (err) {
    console.error('❌ Failed to send:', err);
  }
}

run();
