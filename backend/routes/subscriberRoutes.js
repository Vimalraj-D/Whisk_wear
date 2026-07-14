const express = require('express');
const router = express.Router();
const supabase = require('../config/supabase');
const adminAuth = require('../middleware/adminAuth');
const { sendSubscriptionWelcomeEmail, sendNewsletterCampaignEmail } = require('../services/emailService');

// 1. Subscribe to newsletter (Public)
router.post('/subscribe', async (req, res) => {
  const { email } = req.body;
  if (!email || !email.includes('@')) {
    return res.status(400).json({ error: 'Valid email address is required' });
  }

  try {
    const cleanEmail = email.trim().toLowerCase();

    // Check if already subscribed
    const { data: existing, error: checkError } = await supabase
      .from('subscribers')
      .select('id')
      .eq('email', cleanEmail)
      .maybeSingle();

    if (checkError) throw checkError;

    if (existing) {
      return res.status(200).json({ message: 'You are already subscribed to our newsletter!' });
    }

    // Insert new subscriber
    const { error: insertError } = await supabase
      .from('subscribers')
      .insert([{ email: cleanEmail }]);

    if (insertError) throw insertError;

    // Send welcome email asynchronously
    sendSubscriptionWelcomeEmail(cleanEmail).catch(err => {
      console.error(`Error sending welcome email to ${cleanEmail}:`, err);
    });

    res.status(201).json({ message: 'Thank you for subscribing! A welcome email has been sent.' });
  } catch (err) {
    console.error('Subscription error:', err);
    res.status(500).json({ error: err.message });
  }
});

// 2. Send campaign email to all subscribers (Admin only)
router.post('/send-campaign', adminAuth, async (req, res) => {
  const { subject, title, content, photos } = req.body;

  if (!title || !content) {
    return res.status(400).json({ error: 'Title and content are required for the email campaign' });
  }

  try {
    // Fetch all subscribers
    const { data: subs, error: fetchError } = await supabase
      .from('subscribers')
      .select('email');

    if (fetchError) throw fetchError;

    if (!subs || subs.length === 0) {
      return res.status(200).json({ message: 'No subscribers found to send to.', sentCount: 0 });
    }

    const recipientEmails = subs.map(s => s.email);
    const photoUrls = Array.isArray(photos) ? photos.filter(Boolean) : [];

    // Trigger emails in parallel/sequence
    const results = { success: [], failed: [] };
    
    await Promise.all(
      recipientEmails.map(async (email) => {
        try {
          await sendNewsletterCampaignEmail(email, subject, title, content, photoUrls);
          results.success.push(email);
        } catch (err) {
          console.error(`Campaign email failed for ${email}:`, err);
          results.failed.push({ email, error: err.message });
        }
      })
    );

    res.json({
      message: `Campaign dispatches complete! Sent: ${results.success.length}, Failed: ${results.failed.length}`,
      sentCount: results.success.length,
      failedCount: results.failed.length,
      failures: results.failed
    });
  } catch (err) {
    console.error('Campaign dispatch error:', err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
