const supabase = require('../config/supabase');
const { sendSubscriptionWelcomeEmail, sendNewsletterCampaignEmail } = require('../services/emailService');

exports.subscribe = async (req, res) => {
  const { email } = req.body;
  if (!email || !email.includes('@')) {
    return res.status(400).json({ error: 'Valid email address is required' });
  }

  try {
    const cleanEmail = email.trim().toLowerCase();

    const { data: existing, error: checkError } = await supabase
      .from('subscribers')
      .select('id')
      .eq('email', cleanEmail)
      .maybeSingle();

    if (checkError) throw checkError;

    if (existing) {
      return res.status(200).json({ message: 'You are already subscribed to our newsletter!' });
    }

    const { error: insertError } = await supabase
      .from('subscribers')
      .insert([{ email: cleanEmail }]);

    if (insertError) throw insertError;

    sendSubscriptionWelcomeEmail(cleanEmail).catch(err => {
      console.error(`Error sending welcome email to ${cleanEmail}:`, err);
    });

    res.status(201).json({ message: 'Thank you for subscribing! A welcome email has been sent.' });
  } catch (err) {
    console.error('Subscription error:', err);
    res.status(500).json({ error: err.message });
  }
};

exports.sendCampaign = async (req, res) => {
  const { subject, title, content, photos } = req.body;

  if (!title || !content) {
    return res.status(400).json({ error: 'Title and content are required for the email campaign' });
  }

  try {
    const { data: subs, error: fetchError } = await supabase
      .from('subscribers')
      .select('email');

    if (fetchError) throw fetchError;

    if (!subs || subs.length === 0) {
      return res.status(200).json({ message: 'No subscribers found to send to.', sentCount: 0 });
    }

    const recipientEmails = subs.map(s => s.email);
    const photoUrls = Array.isArray(photos) ? photos.filter(Boolean) : [];

    res.status(202).json({
      message: `Newsletter campaign dispatch started in the background for ${recipientEmails.length} subscribers.`,
      sentCount: recipientEmails.length
    });

    (async () => {
      console.log(`Newsletter campaign dispatch started for ${recipientEmails.length} recipients.`);
      let sent = 0;
      for (const email of recipientEmails) {
        try {
          await sendNewsletterCampaignEmail(email, subject, title, content, photoUrls);
          sent++;
          await new Promise(r => setTimeout(r, 400));
        } catch (err) {
          console.error(`Campaign email failed for ${email}:`, err);
        }
      }
      console.log(`Newsletter campaign dispatch completed. Sent: ${sent}/${recipientEmails.length}`);
    })();

  } catch (err) {
    console.error('Campaign dispatch error:', err);
    res.status(500).json({ error: err.message });
  }
};
