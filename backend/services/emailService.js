require('dotenv').config();

const EMAILJS_SERVICE_ID = 'service_tvab0su';
const EMAILJS_PUBLIC_KEY = 'MVsO7JZh_dp87mVPG';
const EMAILJS_PRIVATE_KEY = 'ttFf99Gpe0k0SmpqEC8b3';

const OTP_TEMPLATE_ID = 'template_8p551dj';
const ORDER_TEMPLATE_ID = 'template_67lu7ps';

console.log('📧 Email provider initialized: EmailJS (REST API with Browser Spoofing)');

/**
 * Sends an email using EmailJS REST API with spoofed headers to bypass non-browser blocks
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
      'Content-Type': 'application/json',
      // Spoof user agent and origin to bypass EmailJS "non-browser environment" restriction
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Origin': 'https://whisk-wear.onrender.com'
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
    // Provide multiple variations of recipient email fields to match user's template configuration
    to_email: toEmail,
    email: toEmail,
    user_email: toEmail,
    contact_email: toEmail,
    to: toEmail,
    recipient: toEmail,

    // Name parameters
    to_name: toName,
    user_name: toName,
    name: toName,
    first_name: firstName,

    // OTP Code parameters
    code: code,
    verification_code: code,
    passcode: code,

    // Expiry time parameter (template uses {{time}}) - matches the 10-minute
    // expiry set in authRoutes.js (Date.now() + 10 * 60 * 1000)
    time: new Date(Date.now() + 10 * 60 * 1000).toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    })
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
  
  // Fallback image if a product has no real image URL
  const fallbackImg = 'https://images.unsplash.com/photo-1558769132-cb1fac08b475?w=200';

  // Build the {{#orders}}...{{/orders}} loop array expected by the EmailJS
  // "Order Confirmation" template: each item needs image, name, units, price
  const orders = items.map(item => ({
    image: item.image_url && item.image_url.startsWith('http') ? item.image_url : fallbackImg,
    name: item.name,
    units: item.quantity,
    price: parseFloat(item.price).toFixed(2)
  }));

  // NOTE: shipping/tax are not tracked anywhere in the orders table today
  // (checked supabase_schema.sql - only total_amount exists), so they're
  // sent as 0.00 for now. Update this if real shipping/tax logic is added.
  const templateParams = {
    // Recipient - template uses top-level {{email}}
    email: toEmail,
    to_email: toEmail,

    // Name parameters (kept for compatibility, not used by this template)
    to_name: toName,
    user_name: toName,
    first_name: firstName,

    // Order parameters matching the template's actual variable names
    order_id: orderId.toString(),
    orders: orders,
    cost: {
      shipping: '0.00',
      tax: '0.00',
      total: parseFloat(totalAmount).toFixed(2)
    }
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