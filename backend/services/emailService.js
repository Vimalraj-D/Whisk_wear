require('dotenv').config();

const EMAILJS_SERVICE_ID = 'service_tvab0su';
const EMAILJS_PUBLIC_KEY = 'MVsO7JZh_dp87mVPG';
const EMAILJS_PRIVATE_KEY = 'ttFf99Gpe0k0SmpqEC8b3';

const OTP_TEMPLATE_ID = 'template_8p551dj';
const ORDER_TEMPLATE_ID = 'template_67lu7ps';

console.log('📧 Email provider initialized: EmailJS (REST API)');

/**
 * Sends an email using EmailJS REST API
 */
async function sendEmailJS(templateId, templateParams) {
  const url = 'https://api.emailjs.com/api/v1.0/email/send';
  const payload = {
    service_id: EMAILJS_SERVICE_ID,
    template_id: templateId,
    user_id: EMAILJS_PUBLIC_KEY,
    accessToken: EMAILJS_PRIVATE_KEY,
    template_params: templateParams
  };

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload)
  });

  const responseText = await response.text();

  if (!response.ok) {
    throw new Error(`EmailJS Error (${response.status}): ${responseText}`);
  }

  return responseText;
}

/**
 * Sends a One-Time Password verification email via EmailJS
 */
async function sendVerificationEmail(toEmail, toName, code) {
  const firstName = toName ? toName.split(' ')[0] : 'Valued Customer';
  
  const templateParams = {
    to_email: toEmail,
    to_name: toName,
    first_name: firstName,
    code: code,
    verification_code: code
  };

  try {
    console.log(`✉️ Sending verification OTP via EmailJS to ${toEmail}...`);
    const result = await sendEmailJS(OTP_TEMPLATE_ID, templateParams);
    console.log(`✅ Verification email sent to ${toEmail} | Response: ${result}`);
    return result;
  } catch (error) {
    console.error('❌ EmailJS OTP verification send error:', error);
    throw error;
  }
}

/**
 * Sends an Order Confirmation email via EmailJS
 */
async function sendOrderConfirmationEmail(toEmail, toName, orderId, totalAmount, items) {
  const firstName = toName ? toName.split(' ')[0] : 'Valued Customer';
  
  // Format items as a readable text list for templates
  const itemsText = items.map(item => {
    return `${item.quantity}x ${item.name} - ₹${parseFloat(item.price).toFixed(2)}`;
  }).join('\n');

  // Format items as HTML rows for templates supporting HTML variables
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

  const templateParams = {
    to_email: toEmail,
    to_name: toName,
    first_name: firstName,
    order_id: orderId.toString(),
    total_amount: parseFloat(totalAmount).toFixed(2),
    items_text: itemsText,
    items_html: itemsHtml
  };

  try {
    console.log(`✉️ Sending order confirmation via EmailJS to ${toEmail}...`);
    const result = await sendEmailJS(ORDER_TEMPLATE_ID, templateParams);
    console.log(`✅ Order confirmation email sent to ${toEmail} | Response: ${result}`);
    return result;
  } catch (error) {
    console.error('❌ EmailJS order confirmation send error:', error);
    throw error;
  }
}

/**
 * Stub/fallback for subscription welcome email (Skipped as requested)
 */
async function sendSubscriptionWelcomeEmail(toEmail) {
  console.log(`✉️ Subscription welcome email stubbed for ${toEmail} (EmailJS templates used only for OTP and order confirmation)`);
  return { message: "Stubbed successfully" };
}

/**
 * Stub/fallback for newsletter campaign email (Skipped as requested)
 */
async function sendNewsletterCampaignEmail(toEmail, subject, campaignTitle, textContent, photoUrls = []) {
  console.log(`✉️ Newsletter campaign email stubbed for ${toEmail} (EmailJS templates used only for OTP and order confirmation)`);
  return { message: "Stubbed successfully" };
}

module.exports = { 
  sendVerificationEmail, 
  sendOrderConfirmationEmail,
  sendSubscriptionWelcomeEmail,
  sendNewsletterCampaignEmail
};
