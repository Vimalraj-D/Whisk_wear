const nodemailer = require('nodemailer');
require('dotenv').config();

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT) || 465,
  secure: true, // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

/**
 * Sends a beautiful branded HTML verification email via Resend
 * @param {string} toEmail - Recipient email
 * @param {string} toName  - Recipient name
 * @param {string} code    - 6-digit OTP code
 */
async function sendVerificationEmail(toEmail, toName, code) {
  const firstName = toName ? toName.split(' ')[0] : 'Valued Customer';

  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Verify Your WhiskWear Account</title>
</head>
<body style="margin:0;padding:0;background-color:#f4f9f4;font-family:'Segoe UI',Arial,sans-serif;">

  <!-- Wrapper -->
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f9f4;padding:40px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">

          <!-- ===== HEADER ===== -->
          <tr>
            <td style="background:#1b4332;border-radius:0px;padding:48px 40px 36px;text-align:center;">

              <!-- Logo Badge -->
              <div style="display:inline-block;background:rgba(255,255,255,0.08);border:1px solid rgba(255,255,255,0.2);border-radius:0px;padding:16px 28px;margin-bottom:20px;backdrop-filter:blur(10px);">
                <img
                  src="https://aoppjuuqdgajcidduqld.supabase.co/storage/v1/object/public/Images/favicon.png"
                  alt="WhiskWear Logo"
                  width="52"
                  height="52"
                  style="display:block;margin:0 auto 10px;border-radius:0px;"
                  onerror="this.style.display='none'"
                />
                <span style="font-size:26px;font-weight:800;color:#ffffff;letter-spacing:2px;text-transform:uppercase;font-family:'Segoe UI',Arial,sans-serif;">
                  WHISK<span style="color:#ffd166;">WEAR</span>
                </span>
              </div>

              <p style="color:rgba(255,255,255,0.75);font-size:14px;margin:0;letter-spacing:1px;text-transform:uppercase;">Kitchen Cloths &amp; Kids Wear</p>
            </td>
          </tr>

          <!-- ===== BODY ===== -->
          <tr>
            <td style="background:#ffffff;padding:48px 48px 36px;">

              <!-- Greeting -->
              <h1 style="font-size:28px;font-weight:700;color:#1b4332;margin:0 0 12px;">
                Hello, ${firstName}! 👋
              </h1>
              <p style="font-size:16px;color:#555;line-height:1.7;margin:0 0 30px;">
                Welcome to <strong style="color:#2d6a4f;">WhiskWear</strong> — your go-to destination for premium kitchen cloths and adorable kids' wear. We're thrilled to have you on board!
              </p>
              <p style="font-size:15px;color:#666;line-height:1.6;margin:0 0 32px;">
                To complete your registration and activate your account, please use the verification code below:
              </p>

              <!-- OTP Box -->
              <div style="text-align:center;margin:0 0 36px;">
                <div style="display:inline-block;background:#1b4332;border-radius:0px;padding:32px 48px;">
                  <p style="color:rgba(255,255,255,0.6);font-size:12px;text-transform:uppercase;letter-spacing:2px;margin:0 0 12px;">Your Verification Code</p>
                  <div style="font-size:48px;font-weight:900;color:#ffd166;letter-spacing:12px;font-family:'Courier New',monospace;line-height:1;">
                    ${code}
                  </div>
                  <p style="color:rgba(255,255,255,0.5);font-size:12px;margin:14px 0 0;">Valid for <strong style="color:#fff;">10 minutes</strong></p>
                </div>
              </div>

              <!-- Instructions -->
              <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f9f4;border-radius:0px;border-left:4px solid #1b4332;margin:0 0 32px;">
                <tr>
                  <td style="padding:20px 24px;">
                    <p style="font-size:14px;color:#444;margin:0;line-height:1.7;">
                      🔐 <strong>How to verify:</strong> Go back to the WhiskWear website, enter this 6-digit code in the verification box, and click <em>"Verify &amp; Activate Account"</em>.
                    </p>
                  </td>
                </tr>
              </table>

              <!-- Security Warning -->
              <table width="100%" cellpadding="0" cellspacing="0" style="background:#fffbeb;border-radius:0px;border-left:4px solid #f59e0b;margin:0 0 32px;">
                <tr>
                  <td style="padding:18px 24px;">
                    <p style="font-size:13px;color:#666;margin:0;line-height:1.7;">
                      ⚠️ If you did not create an account with WhiskWear, please ignore this email. Your personal information is safe.
                    </p>
                  </td>
                </tr>
              </table>

              <!-- Feature Highlights -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 8px;">
                <tr>
                  <td width="33%" style="text-align:center;padding:16px 8px;background:#f4f9f4;border-radius:0px;margin:4px;">
                    <div style="font-size:28px;margin-bottom:6px;">🧺</div>
                    <div style="font-size:12px;font-weight:700;color:#1b4332;text-transform:uppercase;letter-spacing:0.5px;">Kitchen Cloths</div>
                    <div style="font-size:11px;color:#888;margin-top:3px;">Premium Quality</div>
                  </td>
                  <td width="4%"></td>
                  <td width="33%" style="text-align:center;padding:16px 8px;background:#f4f9f4;border-radius:0px;">
                    <div style="font-size:28px;margin-bottom:6px;">👶</div>
                    <div style="font-size:12px;font-weight:700;color:#1b4332;text-transform:uppercase;letter-spacing:0.5px;">Kids Wear</div>
                    <div style="font-size:11px;color:#888;margin-top:3px;">Cute &amp; Comfy</div>
                  </td>
                  <td width="4%"></td>
                  <td width="33%" style="text-align:center;padding:16px 8px;background:#f4f9f4;border-radius:0px;">
                    <div style="font-size:28px;margin-bottom:6px;">🚚</div>
                    <div style="font-size:12px;font-weight:700;color:#1b4332;text-transform:uppercase;letter-spacing:0.5px;">Fast Delivery</div>
                    <div style="font-size:11px;color:#888;margin-top:3px;">At Your Door</div>
                  </td>
                </tr>
              </table>

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
                  This is an automated message. Please do not reply to this email.
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

  try {
    const info = await transporter.sendMail({
      from: `"WhiskWear" <${process.env.SMTP_USER}>`, // sender address
      to: toEmail, // list of receivers
      subject: `${code} — Your WhiskWear Verification Code`, // Subject line
      html: html, // html body
    });

    console.log(`✅ Verification email sent to ${toEmail} | Message ID: ${info.messageId}`);
    return info;
  } catch (error) {
    console.error('❌ Email send error:', error);
    throw new Error(`Failed to send verification email: ${error.message}`);
  }
}

async function sendOrderConfirmationEmail(toEmail, toName, orderId, totalAmount, items) {
  const firstName = toName ? toName.split(' ')[0] : 'Valued Customer';
  
  // Build items table rows
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

  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Your WhiskWear Order Confirmation</title>
</head>
<body style="margin:0;padding:0;background-color:#f8f9fa;font-family:'Segoe UI',Arial,sans-serif;">

  <!-- Wrapper -->
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f8f9fa;padding:40px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#ffffff;box-shadow:0 4px 12px rgba(0,0,0,0.05);border-radius:8px;overflow:hidden;">

          <!-- ===== HEADER ===== -->
          <tr>
            <td style="background:#1b4332;padding:40px 40px;text-align:center;">
              <div style="display:inline-block;background:rgba(255,255,255,0.08);border:1px solid rgba(255,255,255,0.2);border-radius:4px;padding:12px 24px;margin-bottom:15px;">
                <img
                  src="https://aoppjuuqdgajcidduqld.supabase.co/storage/v1/object/public/Images/favicon.png"
                  alt="WhiskWear Logo"
                  width="44"
                  height="44"
                  style="display:block;margin:0 auto 8px;border-radius:4px;"
                />
                <span style="font-size:22px;font-weight:800;color:#ffffff;letter-spacing:1px;text-transform:uppercase;">
                  WHISK<span style="color:#2ec4b6;">WEAR</span>
                </span>
              </div>
              <h1 style="color:#ffffff;font-size:24px;margin:10px 0 0;font-weight:700;">Order Confirmed! 🎉</h1>
              <p style="color:rgba(255,255,255,0.8);font-size:14px;margin:5px 0 0;">Thank you for your purchase. We are processing it right away.</p>
            </td>
          </tr>

          <!-- ===== BODY ===== -->
          <tr>
            <td style="padding:40px 40px 30px;">
              <h2 style="font-size:20px;color:#1b4332;margin:0 0 10px;">Hello, ${firstName}!</h2>
              <p style="font-size:15px;color:#555;line-height:1.6;margin:0 0 25px;">
                Your order <strong>#${orderId}</strong> has been successfully placed. Here are your order details and items.
              </p>

              <!-- Order Info Summary -->
              <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f9f4;border-radius:6px;margin-bottom:25px;border-left:4px solid #1b4332;">
                <tr>
                  <td style="padding:15px 20px;">
                    <div style="font-size:13px;color:#666;text-transform:uppercase;letter-spacing:0.5px;">Order Reference</div>
                    <div style="font-size:18px;font-weight:700;color:#1b4332;margin-top:2px;">#${orderId}</div>
                    <div style="margin-top:10px;font-size:14px;color:#444;line-height:1.6;">
                      📍 <strong>Tracking &amp; Status:</strong> You can track this order's shipping status on your <a href="http://localhost:3000/profile" style="color:#1b4332;font-weight:700;text-decoration:underline;">WhiskWear Profile page</a>.
                    </div>
                  </td>
                </tr>
              </table>

              <!-- Items Table -->
              <h3 style="font-size:16px;color:#1b4332;border-bottom:2px solid #1b4332;padding-bottom:6px;margin:0 0 15px;text-transform:uppercase;letter-spacing:0.5px;">Items Ordered</h3>
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
                  <!-- Totals -->
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

              <!-- ===== RECOMMENDATIONS ===== -->
              <h3 style="font-size:16px;color:#1b4332;border-bottom:2px solid #1b4332;padding-bottom:6px;margin:40px 0 20px;text-transform:uppercase;letter-spacing:0.5px;">Recommended For You</h3>
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td width="48%" style="background:#f8f9fa;border-radius:6px;padding:15px;text-align:center;box-sizing:border-box;vertical-align:top;">
                    <img src="https://images.unsplash.com/photo-1590794056226-79ef3a814c2c?w=200" alt="Kitchen Towels" style="width:100px;height:100px;border-radius:4px;object-fit:cover;margin-bottom:10px;" />
                    <div style="font-size:13px;font-weight:700;color:#333;margin-bottom:5px;min-height:36px;line-height:1.3;">Classic Waffle Weave Towels</div>
                    <div style="font-size:14px;font-weight:700;color:#1b4332;margin-bottom:10px;">₹14.99</div>
                    <a href="http://localhost:3000/shop" style="display:inline-block;background:#1b4332;color:#fff;text-decoration:none;font-size:11px;font-weight:700;padding:6px 12px;border-radius:4px;text-transform:uppercase;letter-spacing:0.5px;">Shop Now</a>
                  </td>
                  <td width="4%"></td>
                  <td width="48%" style="background:#f8f9fa;border-radius:6px;padding:15px;text-align:center;box-sizing:border-box;vertical-align:top;">
                    <img src="https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=200" alt="Baby Romper" style="width:100px;height:100px;border-radius:4px;object-fit:cover;margin-bottom:10px;" />
                    <div style="font-size:13px;font-weight:700;color:#333;margin-bottom:5px;min-height:36px;line-height:1.3;">Organic Cotton Baby Romper</div>
                    <div style="font-size:14px;font-weight:700;color:#1b4332;margin-bottom:10px;">₹24.99</div>
                    <a href="http://localhost:3000/shop" style="display:inline-block;background:#1b4332;color:#fff;text-decoration:none;font-size:11px;font-weight:700;padding:6px 12px;border-radius:4px;text-transform:uppercase;letter-spacing:0.5px;">Shop Now</a>
                  </td>
                </tr>
              </table>

            </td>
          </tr>

          <!-- ===== FOOTER ===== -->
          <tr>
            <td style="background:#1b4332;padding:30px 40px;text-align:center;">
              <p style="color:#ffffff;font-size:16px;font-weight:700;margin:0 0 5px;letter-spacing:1px;">WHISKWEAR</p>
              <p style="color:rgba(255,255,255,0.6);font-size:12px;margin:0 0 15px;">Crafted for every family's everyday story</p>
              <div style="border-top:1px solid rgba(255,255,255,0.1);padding-top:15px;">
                <p style="color:rgba(255,255,255,0.4);font-size:11px;margin:0;line-height:1.5;">
                  © ${new Date().getFullYear()} WhiskWear. All rights reserved.<br/>
                  If you have questions, please reach out to our customer support.
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

  try {
    const info = await transporter.sendMail({
      from: `"WhiskWear" <${process.env.SMTP_USER}>`,
      to: toEmail,
      subject: `Order Confirmed! WhiskWear Order #${orderId}`,
      html: html
    });
    console.log(`✅ Order confirmation email sent to ${toEmail} | Message ID: ${info.messageId}`);
    return info;
  } catch (error) {
    console.error('❌ Order confirmation email error:', error);
  }
}

module.exports = { sendVerificationEmail, sendOrderConfirmationEmail };
