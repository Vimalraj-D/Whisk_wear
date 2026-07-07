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

module.exports = { sendVerificationEmail };
