const nodemailer = require('nodemailer');
const { Resend } = require('resend');
require('dotenv').config();

// Initialize Resend client if key is configured
let resendClient = null;
if (process.env.RESEND_API_KEY) {
  try {
    resendClient = new Resend(process.env.RESEND_API_KEY);
  } catch (err) {
    console.error('Failed to initialize Resend client:', err);
  }
}

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
  // 1. Try sending via Resend API (HTTPS port 443 - not blocked by Render)
  if (resendClient) {
    try {
      console.log(`Sending email to ${to} via Resend HTTP API...`);
      const fromEmail = process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev';
      const data = await resendClient.emails.send({
        from: fromEmail,
        to,
        subject,
        html,
      });
      if (data.error) {
        throw new Error(data.error.message || 'Resend API returned error');
      }
      console.log(`Email successfully sent via Resend API. ID: ${data.data?.id}`);
      return data;
    } catch (resendErr) {
      console.warn(`Resend HTTP API failed, falling back to SMTP. Error: ${resendErr.message}`);
    }
  }

  // 2. SMTP fallback
  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
    console.warn(`\n⚠️ SMTP credentials not configured — email to ${to} was NOT sent.`);
    console.log(`[EMAIL CONTENT PREVIEW]`);
    console.log(`To: ${to}`);
    console.log(`Subject: ${subject}`);
    const textPreview = html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim().substring(0, 300);
    console.log(`Body Preview: ${textPreview}...`);
    console.log(`======================================================\n`);
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
  console.log(`\n======================================================`);
  console.log(`[DEVELOPMENT OTP] Verification code for ${toEmail}: ${code}`);
  console.log(`======================================================\n`);
  
  const html = `
    <div style="background:#f4f9f4;padding:20px;font-family:Arial,sans-serif;">
      <div style="max-width:480px;margin:0 auto;background:#ffffff;border:1px solid rgba(0,0,0,0.06);border-radius:8px;overflow:hidden;box-shadow:0 4px 12px rgba(0,0,0,0.05);">
        
        <!-- Header -->
        <div style="background:#1b4332;padding:25px;text-align:center;">
          <div style="display:inline-block;background:rgba(255,255,255,0.08);border:1px solid rgba(255,255,255,0.2);padding:10px 18px;border-radius:0px;">
            <img
              src="${BRAND_LOGO_URL}"
              alt="WhiskWear Logo"
              width="36"
              height="36"
              style="display:block;margin:0 auto 6px;"
            />
            <span style="font-size:18px;font-weight:bold;color:#ffffff;letter-spacing:1px;text-transform:uppercase;">
              WHISK<span style="color:#ffd166;">WEAR</span>
            </span>
          </div>
          <p style="color:rgba(255,255,255,0.7);font-size:10px;margin:6px 0 0 0;letter-spacing:1px;text-transform:uppercase;">
            Kitchen Cloths &amp; Kids Wear
          </p>
        </div>
        
        <!-- Content Body -->
        <div style="padding:30px 24px;text-align:center;">
          <h2 style="font-size:20px;color:#1b4332;margin:0 0 16px 0;font-weight:bold;font-family:Arial,sans-serif;">
            Verify your email address
          </h2>
          <p style="font-size:14px;color:#444444;line-height:1.5;margin:0 0 16px 0;text-align:left;">
            Hi ${firstName},
          </p>
          <p style="font-size:14px;color:#444444;line-height:1.5;margin:0 0 20px 0;text-align:left;">
            Use the verification code below to confirm your email and complete your signup. This code is valid for <strong>10 minutes</strong>.
          </p>
          
          <div style="margin:24px 0;text-align:center;">
            <span style="font-size:32px;font-weight:bold;letter-spacing:6px;color:#1b4332;background:#f4f9f4;border:1px dashed #1b4332;padding:12px 24px;border-radius:6px;display:inline-block;">${code}</span>
          </div>
          
          <p style="color:#888888;font-size:12px;margin:24px 0 0 0;text-align:left;border-top:1px solid #eeeeee;padding-top:16px;">
            If you didn't request this code, you can safely ignore this email.
          </p>
        </div>
        
        <!-- Footer -->
        <div style="background:#1b4332;padding:20px;text-align:center;">
          <p style="color:#ffd166;font-size:12px;font-weight:bold;margin:0 0 4px 0;letter-spacing:1.2px;text-transform:uppercase;">WHISKWEAR</p>
          <p style="color:rgba(255,255,255,0.5);font-size:9px;margin:0 0 10px 0;">Crafted with Care</p>
          <p style="color:rgba(255,255,255,0.3);font-size:8px;margin:0;">
            © ${new Date().getFullYear()} WhiskWear. All rights reserved.
          </p>
        </div>

      </div>
    </div>`;

  return sendMail({ to: toEmail, subject: 'Your WhiskWear verification code', html });
}

async function sendOrderConfirmationEmail(toEmail, toName, orderId, totalAmount, items) {
  const firstName = toName ? toName.split(' ')[0] : 'there';
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
  const fallbackImg = 'https://images.unsplash.com/photo-1558769132-cb1fac08b475?w=200';

  const rows = (items || []).map(item => {
    const rate = parseFloat(item.price);
    const subtotal = rate * parseInt(item.quantity);
    const imgUrl = item.image_url && item.image_url.startsWith('http') ? item.image_url : fallbackImg;
    
    return `
      <tr style="border-bottom:1px solid #eeeeee;">
        <td style="padding:12px 8px;vertical-align:middle;width:60px;">
          <img src="${imgUrl}" alt="${item.name}" style="width:48px;height:48px;object-fit:cover;border-radius:6px;border:1px solid #dddddd;display:block;" />
        </td>
        <td style="padding:12px 8px;vertical-align:middle;font-family:Arial,sans-serif;font-size:13px;color:#333333;">
          <div style="font-weight:bold;margin-bottom:2px;">${item.name}</div>
          <div style="color:#666666;font-size:11px;">Qty: ${item.quantity} @ ₹${rate.toFixed(2)}</div>
        </td>
        <td style="padding:12px 8px;vertical-align:middle;text-align:right;font-family:Arial,sans-serif;font-size:13px;font-weight:bold;color:#1b4332;white-space:nowrap;">
          ₹${subtotal.toFixed(2)}
        </td>
      </tr>`;
  }).join('');

  const html = `
    <div style="background:#f4f9f4;padding:20px;font-family:Arial,sans-serif;">
      <div style="max-width:520px;margin:0 auto;background:#ffffff;border:1px solid rgba(0,0,0,0.06);border-radius:8px;overflow:hidden;box-shadow:0 4px 12px rgba(0,0,0,0.05);">
        
        <!-- Header -->
        <div style="background:#1b4332;padding:25px;text-align:center;">
          <div style="display:inline-block;background:rgba(255,255,255,0.08);border:1px solid rgba(255,255,255,0.2);padding:10px 18px;border-radius:0px;">
            <img
              src="${BRAND_LOGO_URL}"
              alt="WhiskWear Logo"
              width="36"
              height="36"
              style="display:block;margin:0 auto 6px;"
            />
            <span style="font-size:18px;font-weight:bold;color:#ffffff;letter-spacing:1px;text-transform:uppercase;">
              WHISK<span style="color:#ffd166;">WEAR</span>
            </span>
          </div>
          <p style="color:rgba(255,255,255,0.7);font-size:10px;margin:6px 0 0 0;letter-spacing:1px;text-transform:uppercase;">
            Kitchen Cloths &amp; Kids Wear
          </p>
        </div>
        
        <!-- Content Body -->
        <div style="padding:25px;min-height:180px;">
          <h2 style="font-size:18px;color:#1b4332;margin:0 0 10px 0;font-weight:bold;font-family:Arial,sans-serif;">
            Order Confirmed!
          </h2>
          <p style="font-size:13px;color:#444444;line-height:1.5;margin:0 0 12px 0;">
            Hi ${firstName},
          </p>
          <p style="font-size:13px;color:#444444;line-height:1.5;margin:0 0 20px 0;">
            Thank you for your purchase. Your order <strong>#${orderId}</strong> has been confirmed and is being processed. Here are your order details:
          </p>
          
          <!-- Product Table -->
          <table style="width:100%;border-collapse:collapse;margin:16px 0;border-top:2px solid #1b4332;border-bottom:2px solid #1b4332;">
            <thead>
              <tr style="background:#f9f9f9;">
                <th style="padding:8px;text-align:left;font-size:11px;color:#666666;text-transform:uppercase;letter-spacing:0.5px;">Item</th>
                <th style="padding:8px;text-align:left;font-size:11px;color:#666666;text-transform:uppercase;letter-spacing:0.5px;">Details</th>
                <th style="padding:8px;text-align:right;font-size:11px;color:#666666;text-transform:uppercase;letter-spacing:0.5px;">Subtotal</th>
              </tr>
            </thead>
            <tbody>
              ${rows}
            </tbody>
          </table>
          
          <!-- Summary Total -->
          <div style="text-align:right;margin:16px 0;font-family:Arial,sans-serif;">
            <span style="font-size:14px;color:#555555;margin-right:8px;">Grand Total:</span>
            <span style="font-size:20px;font-weight:bold;color:#1b4332;">₹${parseFloat(totalAmount).toFixed(2)}</span>
          </div>

          <!-- Track Order CTA Button -->
          <div style="text-align:center;margin:30px 0 10px 0;">
            <a href="${frontendUrl}/track/${orderId}" target="_blank" style="background:#1b4332;color:#ffffff;text-decoration:none;padding:14px 28px;font-size:13px;font-weight:bold;border-radius:30px;letter-spacing:1px;display:inline-block;box-shadow:0 4px 10px rgba(27,67,50,0.2);text-transform:uppercase;font-family:Arial,sans-serif;">
              Track Your Order
            </a>
          </div>
          
        </div>
        
        <!-- Footer -->
        <div style="background:#1b4332;padding:20px;text-align:center;font-family:Arial,sans-serif;">
          <p style="color:#ffd166;font-size:13px;font-weight:bold;margin:0 0 4px 0;letter-spacing:1.2px;text-transform:uppercase;">WHISKWEAR</p>
          <p style="color:rgba(255,255,255,0.5);font-size:10px;margin:0 0 10px 0;">Crafted with Care</p>
          <div style="border-top:1px solid rgba(255,255,255,0.1);padding-top:10px;margin-top:10px;">
            <p style="color:rgba(255,255,255,0.3);font-size:9px;margin:0 0 8px 0;">
              © ${new Date().getFullYear()} WhiskWear. All rights reserved.
            </p>
            <p style="color:rgba(255,255,255,0.4);font-size:8px;margin:0;">
              Thank you for shopping with us!
            </p>
          </div>
        </div>

      </div>
    </div>`;

  return sendMail({ to: toEmail, subject: `Order #${orderId} Confirmed - WhiskWear`, html });
}

async function sendSubscriptionWelcomeEmail(toEmail) {
  const html = `
    <div style="background:#f4f9f4;padding:20px;font-family:Arial,sans-serif;">
      <div style="max-width:480px;margin:0 auto;background:#ffffff;border:1px solid rgba(0,0,0,0.06);border-radius:8px;overflow:hidden;box-shadow:0 4px 12px rgba(0,0,0,0.05);">
        
        <!-- Header -->
        <div style="background:#1b4332;padding:25px;text-align:center;">
          <div style="display:inline-block;background:rgba(255,255,255,0.08);border:1px solid rgba(255,255,255,0.2);padding:10px 18px;border-radius:0px;">
            <img
              src="${BRAND_LOGO_URL}"
              alt="WhiskWear Logo"
              width="36"
              height="36"
              style="display:block;margin:0 auto 6px;"
            />
            <span style="font-size:18px;font-weight:bold;color:#ffffff;letter-spacing:1px;text-transform:uppercase;">
              WHISK<span style="color:#ffd166;">WEAR</span>
            </span>
          </div>
          <p style="color:rgba(255,255,255,0.7);font-size:10px;margin:6px 0 0 0;letter-spacing:1px;text-transform:uppercase;">
            Kitchen Cloths &amp; Kids Wear
          </p>
        </div>
        
        <!-- Content Body -->
        <div style="padding:30px 24px;">
          <h2 style="font-size:20px;color:#1b4332;margin:0 0 16px 0;font-weight:bold;font-family:Arial,sans-serif;">
            Welcome to WhiskWear!
          </h2>
          <p style="font-size:13px;color:#444444;line-height:1.6;margin:0 0 16px 0;">
            Thank you for subscribing to our newsletter. We're thrilled to have you as part of our community!
          </p>
          <p style="font-size:13px;color:#444444;line-height:1.6;margin:0 0 20px 0;">
            You will now be the first to know about our latest premium collection arrivals, exclusive offers, and style recommendations.
          </p>
          
          <div style="background:#f4f9f4;border-left:4px solid #1b4332;padding:12px;margin:20px 0;font-size:12px;color:#555555;font-style:italic;">
            "We believe that premium quality in kitchen cloths and kidswear transforms everyday experiences."
          </div>
          
          <p style="color:#888888;font-size:11px;margin:24px 0 0 0;border-top:1px solid #eeeeee;padding-top:16px;">
            If you wish to change your notification preferences, you can unsubscribe at any time.
          </p>
        </div>
        
        <!-- Footer -->
        <div style="background:#1b4332;padding:20px;text-align:center;">
          <p style="color:#ffd166;font-size:12px;font-weight:bold;margin:0 0 4px 0;letter-spacing:1.2px;text-transform:uppercase;">WHISKWEAR</p>
          <p style="color:rgba(255,255,255,0.5);font-size:9px;margin:0 0 10px 0;">Crafted with Care</p>
          <p style="color:rgba(255,255,255,0.3);font-size:8px;margin:0;">
            © ${new Date().getFullYear()} WhiskWear. All rights reserved.
          </p>
        </div>

      </div>
    </div>`;

  return sendMail({ to: toEmail, subject: 'Welcome to WhiskWear!', html });
}

async function sendNewsletterCampaignEmail(toEmail, subject, title, textContent, photoUrls = []) {
  console.log(`\n======================================================`);
  console.log(`[NEWSLETTER CAMPAIGN] Dispatching email to: ${toEmail}`);
  console.log(`Subject: ${subject || title}`);
  console.log(`Title: ${title}`);
  console.log(`Content length: ${textContent.length} characters`);
  console.log(`Photos included: ${photoUrls.length}`);
  console.log(`======================================================\n`);

  // Translate double line breaks into paragraph tags matching the live preview layout
  const paragraphs = textContent
    .split(/\n\n+/)
    .map(p => {
      const lines = p.split('\n').join('<br/>');
      return `<p style="font-size:13px;color:#444444;line-height:1.6;margin:0 0 12px 0;font-family:Arial,sans-serif;">${lines}</p>`;
    })
    .join('');

  const images = (photoUrls || [])
    .map((url, idx) => `
      <div style="margin:15px 0;text-align:center;">
        <img 
          src="${url}" 
          alt="Campaign visual ${idx + 1}" 
          style="max-width:100%;height:auto;border-radius:6px;max-height:220px;object-fit:contain;border:1px solid #dddddd;" 
        />
      </div>`)
    .join('');

  const html = `
    <div style="background:#f4f9f4;padding:20px;font-family:Arial,sans-serif;">
      <div style="max-width:520px;margin:0 auto;background:#ffffff;border:1px solid rgba(0,0,0,0.06);border-radius:8px;overflow:hidden;box-shadow:0 4px 12px rgba(0,0,0,0.05);">
        
        <!-- Header -->
        <div style="background:#1b4332;padding:25px;text-align:center;">
          <div style="display:inline-block;background:rgba(255,255,255,0.08);border:1px solid rgba(255,255,255,0.2);padding:10px 18px;border-radius:0px;">
            <img
              src="${BRAND_LOGO_URL}"
              alt="WhiskWear Logo"
              width="36"
              height="36"
              style="display:block;margin:0 auto 6px;"
            />
            <span style="font-size:18px;font-weight:bold;color:#ffffff;letter-spacing:1px;text-transform:uppercase;">
              WHISK<span style="color:#ffd166;">WEAR</span>
            </span>
          </div>
          <p style="color:rgba(255,255,255,0.7);font-size:10px;margin:6px 0 0 0;letter-spacing:1px;text-transform:uppercase;">
            Kitchen Cloths &amp; Kids Wear
          </p>
        </div>
        
        <!-- Content Body -->
        <div style="padding:25px;min-height:180px;">
          <h2 style="font-size:18px;color:#1b4332;margin:0 0 16px 0;font-weight:bold;font-family:Arial,sans-serif;">
            ${title}
          </h2>
          ${paragraphs}
          ${images}
        </div>
        
        <!-- Footer -->
        <div style="background:#1b4332;padding:20px;text-align:center;font-family:Arial,sans-serif;">
          <p style="color:#ffd166;font-size:13px;font-weight:bold;margin:0 0 4px 0;letter-spacing:1.2px;text-transform:uppercase;">WHISKWEAR</p>
          <p style="color:rgba(255,255,255,0.5);font-size:10px;margin:0 0 10px 0;">Crafted with Care</p>
          <div style="border-top:1px solid rgba(255,255,255,0.1);padding-top:10px;margin-top:10px;">
            <p style="color:rgba(255,255,255,0.3);font-size:9px;margin:0 0 8px 0;">
              © ${new Date().getFullYear()} WhiskWear. All rights reserved.
            </p>
            <p style="color:rgba(255,255,255,0.4);font-size:8px;margin:0;">
              You are receiving this email because you subscribed to WhiskWear.
            </p>
          </div>
        </div>

      </div>
    </div>`;

  return sendMail({ to: toEmail, subject: subject || title, html });
}

module.exports = {
  sendVerificationEmail,
  sendOrderConfirmationEmail,
  sendSubscriptionWelcomeEmail,
  sendNewsletterCampaignEmail,
};
