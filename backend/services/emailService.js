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

const EMAIL_FROM = process.env.EMAIL_FROM || 'WhiskWear <noreply@whiskwear.com>';
const BRAND_LOGO_URL = process.env.BRAND_LOGO_URL || 'https://aoppjuuqdgajcidduqld.supabase.co/storage/v1/object/public/Images/favicon.png';

async function sendMail({ to, subject, html }) {
  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
    console.warn(' SMTP credentials not configured — email not sent.');
    return null;
  }
  const result = await transporter.sendMail({
    from: EMAIL_FROM,
    to,
    subject,
    html,
  });
  return result;
}

async function sendVerificationEmail(toEmail, toName, code) {
  const firstName = toName ? toName.split(' ')[0] : 'there';
  const html = `
    <div style="font-family:Arial,sans-serif;max-width:480px;margin:auto;padding:24px;">
      <img src="${BRAND_LOGO_URL}" alt="WhiskWear" style="height:48px;margin-bottom:16px;" />
      <h2 style="color:#333;">Verify your email</h2>
      <p>Hi ${firstName},</p>
      <p>Use the code below to verify your email address. It expires in <strong>10 minutes</strong>.</p>
      <div style="text-align:center;margin:24px 0;">
        <span style="font-size:32px;font-weight:bold;letter-spacing:8px;color:#111;background:#f4f4f4;padding:12px 24px;border-radius:8px;">${code}</span>
      </div>
      <p style="color:#888;font-size:13px;">If you didn't request this, you can safely ignore this email.</p>
    </div>`;
  return sendMail({ to: toEmail, subject: 'Your WhiskWear verification code', html });
}

async function sendOrderConfirmationEmail(toEmail, toName, orderId, totalAmount, items) {
  const firstName = toName ? toName.split(' ')[0] : 'there';
  const fallbackImg = 'https://images.unsplash.com/photo-1558769132-cb1fac08b475?w=200';
  const rows = (items || []).map(item => `
    <tr>
      <td style="padding:8px;border-bottom:1px solid #eee;">
        <img src="${item.image_url && item.image_url.startsWith('http') ? item.image_url : fallbackImg}" alt="" style="width:48px;height:48px;object-fit:cover;border-radius:4px;" />
      </td>
      <td style="padding:8px;border-bottom:1px solid #eee;">${item.name} x${item.quantity}</td>
      <td style="padding:8px;border-bottom:1px solid #eee;text-align:right;">${parseFloat(item.price).toFixed(2)}</td>
    </tr>`).join('');

  const html = `
    <div style="font-family:Arial,sans-serif;max-width:520px;margin:auto;padding:24px;">
      <img src="${BRAND_LOGO_URL}" alt="WhiskWear" style="height:48px;margin-bottom:16px;" />
      <h2 style="color:#333;">Order Confirmed!</h2>
      <p>Hi ${firstName},</p>
      <p>Your order <strong>#${orderId}</strong> has been confirmed.</p>
      <table style="width:100%;border-collapse:collapse;margin:16px 0;">
        <thead><tr style="border-bottom:2px solid #333;"><th style="padding:8px;text-align:left;">Item</th><th style="padding:8px;text-align:left;">Details</th><th style="padding:8px;text-align:right;">Price</th></tr></thead>
        <tbody>${rows}</tbody>
      </table>
      <p style="text-align:right;font-size:18px;font-weight:bold;">Total: ${parseFloat(totalAmount).toFixed(2)}</p>
      <p style="color:#888;font-size:13px;">Thank you for shopping with WhiskWear!</p>
    </div>`;
  return sendMail({ to: toEmail, subject: `Order #${orderId} Confirmed - WhiskWear`, html });
}

async function sendSubscriptionWelcomeEmail(toEmail) {
  const html = `
    <div style="font-family:Arial,sans-serif;max-width:480px;margin:auto;padding:24px;">
      <img src="${BRAND_LOGO_URL}" alt="WhiskWear" style="height:48px;margin-bottom:16px;" />
      <h2 style="color:#333;">Welcome to WhiskWear!</h2>
      <p>You're now subscribed to our newsletter. Expect new arrivals, offers, and style tips in your inbox.</p>
      <p style="color:#888;font-size:13px;">You can unsubscribe at any time.</p>
    </div>`;
  return sendMail({ to: toEmail, subject: 'Welcome to WhiskWear!', html });
}

async function sendNewsletterCampaignEmail(toEmail, subject, title, textContent, photoUrls = []) {
  const images = (photoUrls || []).map(url => `<img src="${url}" style="width:100%;max-width:400px;border-radius:8px;margin:8px 0;" />`).join('');
  const html = `
    <div style="font-family:Arial,sans-serif;max-width:480px;margin:auto;padding:24px;">
      <img src="${BRAND_LOGO_URL}" alt="WhiskWear" style="height:48px;margin-bottom:16px;" />
      <h2 style="color:#333;">${title}</h2>
      <p>${textContent}</p>
      ${images}
      <p style="color:#888;font-size:13px;margin-top:24px;">You're receiving this because you subscribed to WhiskWear updates.</p>
    </div>`;
  return sendMail({ to: toEmail, subject: subject || title, html });
}

module.exports = {
  sendVerificationEmail,
  sendOrderConfirmationEmail,
  sendSubscriptionWelcomeEmail,
  sendNewsletterCampaignEmail,
};
