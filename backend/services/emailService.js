const { Resend } = require('resend');
require('dotenv').config();

const resend = new Resend(process.env.RESEND_API_KEY);
const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev';

console.log(`📧 Email provider: Resend (HTTP API) — from: ${FROM_EMAIL}`);

// A helper to generate the formal template envelope
function getFormalTemplate(title, bodyHtml) {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>${title}</title>
</head>
<body style="margin:0;padding:0;background-color:#f4f9f4;font-family:'Segoe UI',Arial,sans-serif;">

  <!-- Wrapper -->
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f9f4;padding:40px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#ffffff;box-shadow:0 4px 12px rgba(0,0,0,0.05);border-radius:8px;overflow:hidden;">

          <!-- ===== HEADER ===== -->
          <tr>
            <td style="background:#1b4332;border-radius:0px;padding:40px 40px;text-align:center;">

              <!-- Logo Badge -->
              <div style="display:inline-block;background:rgba(255,255,255,0.08);border:1px solid rgba(255,255,255,0.2);padding:14px 24px;margin-bottom:12px;backdrop-filter:blur(10px);">
                <img
                  src="https://aoppjuuqdgajcidduqld.supabase.co/storage/v1/object/public/Images/favicon.png"
                  alt="WhiskWear Logo"
                  width="48"
                  height="48"
                  style="display:block;margin:0 auto 8px;"
                  onerror="this.style.display='none'"
                />
                <span style="font-size:24px;font-weight:800;color:#ffffff;letter-spacing:2px;text-transform:uppercase;font-family:'Segoe UI',Arial,sans-serif;">
                  WHISK<span style="color:#ffd166;">WEAR</span>
                </span>
              </div>

              <p style="color:rgba(255,255,255,0.75);font-size:13px;margin:0;letter-spacing:1px;text-transform:uppercase;">Kitchen Cloths &amp; Kids Wear</p>
            </td>
          </tr>

          <!-- ===== BODY ===== -->
          <tr>
            <td style="background:#ffffff;padding:40px 40px 30px;">
              ${bodyHtml}
            </td>
          </tr>

          <!-- ===== FOOTER ===== -->
          <tr>
            <td style="background:#1b4332;border-radius:0px;padding:32px 40px;text-align:center;">
              <p style="color:#ffd166;font-size:18px;font-weight:700;margin:0 0 6px;letter-spacing:1px;">WHISKWEAR</p>
              <p style="color:rgba(255,255,255,0.5);font-size:12px;margin:0 0 16px;">Kitchen Cloths &amp; Kids Wear — Crafted with Care</p>
              <div style="border-top:1px solid rgba(255,255,255,0.1);padding-top:16px;">
                <p style="color:rgba(255,255,255,0.35);font-size:11px;margin:0;">
                  © ${new Date().getFullYear()} WhiskWear. All rights reserved.<br/>
                  If you wish to unsubscribe, click <a href="#" style="color:#ffd166;text-decoration:underline;">here</a>.
                </p>
              </div>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>

</body>
</html>
  `.trim();
}

/**
 * Sends a beautiful branded HTML verification email via Resend
 */
async function sendVerificationEmail(toEmail, toName, code) {
  const firstName = toName ? toName.split(' ')[0] : 'Valued Customer';

  const bodyHtml = `
    <h1 style="font-size:26px;font-weight:700;color:#1b4332;margin:0 0 12px;">
      Hello, ${firstName}! 👋
    </h1>
    <p style="font-size:16px;color:#555;line-height:1.7;margin:0 0 25px;">
      Welcome to <strong style="color:#2d6a4f;">WhiskWear</strong> — your go-to destination for premium kitchen cloths and adorable kids' wear. We're thrilled to have you on board!
    </p>
    <p style="font-size:15px;color:#666;line-height:1.6;margin:0 0 28px;">
      To complete your registration and activate your account, please use the verification code below:
    </p>

    <!-- OTP Box -->
    <div style="text-align:center;margin:0 0 32px;">
      <div style="display:inline-block;background:#1b4332;border-radius:4px;padding:24px 40px;">
        <p style="color:rgba(255,255,255,0.6);font-size:11px;text-transform:uppercase;letter-spacing:2px;margin:0 0 10px;">Your Verification Code</p>
        <div style="font-size:44px;font-weight:900;color:#ffd166;letter-spacing:10px;font-family:'Courier New',monospace;line-height:1;">
          ${code}
        </div>
        <p style="color:rgba(255,255,255,0.5);font-size:11px;margin:12px 0 0;">Valid for <strong style="color:#fff;">10 minutes</strong></p>
      </div>
    </div>

    <!-- Instructions -->
    <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f9f4;border-radius:4px;border-left:4px solid #1b4332;margin:0 0 28px;">
      <tr>
        <td style="padding:18px 20px;">
          <p style="font-size:14px;color:#444;margin:0;line-height:1.6;">
            🔐 <strong>How to verify:</strong> Enter this 6-digit code in the verification box on the registration screen and click <em>"Verify &amp; Activate Account"</em>.
          </p>
        </td>
      </tr>
    </table>
  `;

  const html = getFormalTemplate('Verify Your WhiskWear Account', bodyHtml);

  try {
    const { data, error } = await resend.emails.send({
      from: `WhiskWear <${FROM_EMAIL}>`,
      to: [toEmail],
      subject: `${code} — Your WhiskWear Verification Code`,
      html: html,
    });
    if (error) throw new Error(error.message || JSON.stringify(error));
    console.log(`✅ Verification email sent to ${toEmail} | ID: ${data?.id}`);
    return data;
  } catch (error) {
    console.error('❌ Email send error:', error);
    throw new Error(`Failed to send verification email: ${error.message}`);
  }
}

async function sendOrderConfirmationEmail(toEmail, toName, orderId, totalAmount, items) {
  const firstName = toName ? toName.split(' ')[0] : 'Valued Customer';
  
  const itemsHtml = items.map(item => {
    const itemPrice = parseFloat(item.price).toFixed(2);
    const itemTotal = (parseFloat(item.price) * item.quantity).toFixed(2);
    const imgUrl = item.image_url ? (item.image_url.startsWith('http') ? item.image_url : `https://images.unsplash.com/photo-1558769132-cb1fac08b475?w=200`) : `https://images.unsplash.com/photo-1558769132-cb1fac08b475?w=200`;
    
    return `
      <tr style="border-bottom:1px solid #eee;">
        <td style="padding:12px 8px;vertical-align:middle;text-align:center;">
          <img src="${imgUrl}" alt="${item.name}" width="50" height="50" style="border-radius:4px;object-fit:cover;display:block;margin:0 auto;background:#f8f9fa;" />
        </td>
        <td style="padding:12px 8px;vertical-align:middle;color:#333;font-size:14px;font-weight:600;">
          ${item.name}
        </td>
        <td style="padding:12px 8px;vertical-align:middle;color:#555;font-size:14px;text-align:center;">
          ${item.quantity}
        </td>
        <td style="padding:12px 8px;vertical-align:middle;color:#333;font-size:14px;text-align:right;font-weight:600;">
          ₹${itemPrice}
        </td>
        <td style="padding:12px 8px;vertical-align:middle;color:#333;font-size:14px;text-align:right;font-weight:700;">
          ₹${itemTotal}
        </td>
      </tr>
    `;
  }).join('');

  const bodyHtml = `
    <h2 style="font-size:22px;color:#1b4332;margin:0 0 10px;font-family:'Segoe UI',Arial,sans-serif;">Order Confirmed! 🎉</h2>
    <p style="font-size:15px;color:#555;line-height:1.6;margin:0 0 20px;">
      Hello, ${firstName}! Your order <strong>#${orderId}</strong> has been successfully placed. Here are your order details and items.
    </p>

    <!-- Order Info Summary -->
    <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f9f4;border-radius:6px;margin-bottom:25px;border-left:4px solid #1b4332;">
      <tr>
        <td style="padding:15px 20px;">
          <div style="font-size:13px;color:#666;text-transform:uppercase;letter-spacing:0.5px;">Order Reference</div>
          <div style="font-size:18px;font-weight:700;color:#1b4332;margin-top:2px;">#${orderId}</div>
        </td>
      </tr>
    </table>

    <!-- Items Table -->
    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:25px;border-collapse:collapse;">
      <thead>
        <tr style="border-bottom:1px solid #ddd;color:#666;font-size:12px;text-transform:uppercase;">
          <th align="center" style="padding:8px;width:60px;">Image</th>
          <th align="left" style="padding:8px;">Product</th>
          <th align="center" style="padding:8px;width:50px;">Qty</th>
          <th align="right" style="padding:8px;width:70px;">Price</th>
          <th align="right" style="padding:8px;width:80px;">Total</th>
        </tr>
      </thead>
      <tbody>
        ${itemsHtml}
        <tr style="border-top:2px solid #ddd;">
          <td colspan="3"></td>
          <td align="right" style="padding:12px 8px;font-size:14px;color:#555;">Subtotal:</td>
          <td align="right" style="padding:12px 8px;font-size:14px;font-weight:700;color:#333;">₹${parseFloat(totalAmount).toFixed(2)}</td>
        </tr>
        <tr>
          <td colspan="3"></td>
          <td align="right" style="padding:6px 8px;font-size:14px;color:#555;">Delivery:</td>
          <td align="right" style="padding:6px 8px;font-size:14px;font-weight:700;color:#2ecc71;">FREE</td>
        </tr>
        <tr style="border-top:1px solid #eee;">
          <td colspan="3"></td>
          <td align="right" style="padding:12px 8px;font-size:16px;font-weight:700;color:#1b4332;">Grand Total:</td>
          <td align="right" style="padding:12px 8px;font-size:18px;font-weight:800;color:#1b4332;">₹${parseFloat(totalAmount).toFixed(2)}</td>
        </tr>
      </tbody>
    </table>
  `;

  const html = getFormalTemplate('Order Confirmation - WhiskWear', bodyHtml);

  try {
    const { data, error } = await resend.emails.send({
      from: `WhiskWear <${FROM_EMAIL}>`,
      to: [toEmail],
      subject: `Order Confirmed! WhiskWear Order #${orderId}`,
      html: html,
    });
    if (error) throw new Error(error.message || JSON.stringify(error));
    console.log(`✅ Order confirmation email sent to ${toEmail} | ID: ${data?.id}`);
    return data;
  } catch (error) {
    console.error('❌ Order confirmation email error:', error);
    throw error;
  }
}

/**
 * Sends a welcome/invitation email when a user subscribes for the first time
 */
async function sendSubscriptionWelcomeEmail(toEmail) {
  const bodyHtml = `
    <h2 style="font-size:22px;color:#1b4332;margin:0 0 12px;font-family:'Segoe UI',Arial,sans-serif;">Welcome to WhiskWear Insider! ✦</h2>
    <p style="font-size:16px;color:#333;line-height:1.7;margin:0 0 20px;">
      Hello! Thank you for subscribing to the WhiskWear newsletter.
    </p>
    <p style="font-size:15px;color:#555;line-height:1.6;margin:0 0 25px;">
      You have successfully joined our exclusive list. You will be the first to receive updates on new seasonal collections, curated chef apparel, kitchen utility designs, and special promotions directly in your inbox.
    </p>

    <!-- Welcome Promo Box -->
    <div style="background:#f4f9f4;border-radius:6px;border-left:4px solid #1b4332;padding:20px 24px;margin-bottom:28px;">
      <p style="font-size:14px;color:#1b4332;margin:0;line-height:1.6;font-weight:bold;">
        🎁 Subscriber perk: Keep an eye out for our upcoming newsletter to receive custom offers!
      </p>
    </div>

    <p style="font-size:14px;color:#666;line-height:1.6;margin:0 0 10px;">
      In the meantime, feel free to explore our shop and check out what's new.
    </p>
    <div style="text-align:center;margin:25px 0 10px;">
      <a href="http://localhost:3000/shop" style="display:inline-block;background:#1b4332;color:#ffffff;text-decoration:none;font-size:14px;font-weight:700;padding:12px 30px;border-radius:50px;text-transform:uppercase;letter-spacing:1px;box-shadow:0 3px 6px rgba(0,0,0,0.1);">Shop Now</a>
    </div>
  `;

  const html = getFormalTemplate('Welcome to WhiskWear Newsletter!', bodyHtml);

  try {
    const { data, error } = await resend.emails.send({
      from: `WhiskWear <${FROM_EMAIL}>`,
      to: [toEmail],
      subject: `Welcome to WhiskWear! ✦ Subscription Confirmed`,
      html: html,
    });
    if (error) throw new Error(error.message || JSON.stringify(error));
    console.log(`✅ Welcome newsletter email sent to ${toEmail} | ID: ${data?.id}`);
    return data;
  } catch (error) {
    console.error('❌ Subscription welcome email error:', error);
    throw error;
  }
}

/**
 * Sends an email campaign to a subscriber with custom subject, title, text, and photos.
 */
async function sendNewsletterCampaignEmail(toEmail, subject, campaignTitle, textContent, photoUrls = []) {
  // Break text content by double newlines into styled paragraphs
  const paragraphsHtml = textContent
    .split(/\n\n+/)
    .map(p => `<p style="font-size:15px;color:#444;line-height:1.7;margin:0 0 16px;">${p.replace(/\n/g, '<br/>')}</p>`)
    .join('');

  // Render photos if available
  let photosHtml = '';
  if (photoUrls && photoUrls.length > 0) {
    const photoElements = photoUrls.map(url => {
      if (!url) return '';
      return `
        <div style="margin-bottom:20px;text-align:center;">
          <img 
            src="${url}" 
            alt="Campaign Image" 
            style="max-width:100%;width:500px;height:auto;border-radius:8px;box-shadow:0 2px 8px rgba(0,0,0,0.1);display:block;margin:0 auto;" 
            onerror="this.style.display='none'"
          />
        </div>
      `;
    }).join('');
    
    photosHtml = `
      <div style="margin-top:25px;margin-bottom:20px;">
        ${photoElements}
      </div>
    `;
  }

  const bodyHtml = `
    <h2 style="font-size:22px;color:#1b4332;margin:0 0 15px;font-family:'Segoe UI',Arial,sans-serif;line-height:1.3;font-weight:700;">${campaignTitle}</h2>
    
    <div>
      ${paragraphsHtml}
    </div>

    ${photosHtml}

    <div style="text-align:center;margin:30px 0 10px;">
      <a href="http://localhost:3000/shop" style="display:inline-block;background:#1b4332;color:#ffffff;text-decoration:none;font-size:13px;font-weight:700;padding:10px 24px;border-radius:50px;text-transform:uppercase;letter-spacing:1px;">Visit WhiskWear Store</a>
    </div>
  `;

  const html = getFormalTemplate(campaignTitle, bodyHtml);

  try {
    const { data, error } = await resend.emails.send({
      from: `WhiskWear <${FROM_EMAIL}>`,
      to: [toEmail],
      subject: subject || campaignTitle,
      html: html,
    });
    if (error) throw new Error(error.message || JSON.stringify(error));
    console.log(`✅ Campaign email sent to ${toEmail} | ID: ${data?.id}`);
    return data;
  } catch (error) {
    console.error(`❌ Campaign email failed for ${toEmail}:`, error);
    throw error;
  }
}

module.exports = { 
  sendVerificationEmail, 
  sendOrderConfirmationEmail,
  sendSubscriptionWelcomeEmail,
  sendNewsletterCampaignEmail
};
