const express = require('express');
const router = express.Router();
const supabase = require('../config/supabase');
const { sendVerificationEmail } = require('../services/emailService');
require('dotenv').config();

// ──────────────────────────────────────────
//  ADMIN LOGIN
// ──────────────────────────────────────────
router.post('/admin/login', (req, res) => {
  const { username, password } = req.body;
  if (username === 'admin' && password === 'whiskwear2026') {
    return res.json({ success: true, token: process.env.ADMIN_SECRET, user: { username: 'admin', role: 'administrator' } });
  }
  return res.status(401).json({ error: 'Invalid admin credentials' });
});

// ──────────────────────────────────────────
//  STEP 1: INITIATE SIGNUP (name + email → send OTP)
// ──────────────────────────────────────────
router.post('/user/initiate', async (req, res) => {
  try {
    const { name, email } = req.body;
    if (!name || !email) return res.status(400).json({ error: 'Name and email are required' });

    // Check for existing fully-registered account (verified + has password)
    const { data: existing, error: checkErr } = await supabase
      .from('users')
      .select('id, is_verified, password')
      .eq('email', email.toLowerCase())
      .maybeSingle();
    if (checkErr) throw checkErr;

    if (existing && existing.is_verified && existing.password) {
      return res.status(400).json({ error: 'An account with this email already exists. Please log in.' });
    }

    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString();

    if (existing) {
      // Update existing incomplete record
      await supabase.from('users').update({
        name,
        verification_code: code,
        code_expires_at: expiresAt,
        is_verified: false
      }).eq('id', existing.id);
    } else {
      // Create new partial record (no password yet)
      const { error: insertErr } = await supabase.from('users').insert([{
        name,
        email: email.toLowerCase(),
        password: '',
        is_verified: false,
        verification_code: code,
        code_expires_at: expiresAt
      }]);
      if (insertErr) throw insertErr;
    }

    await sendVerificationEmail(email.toLowerCase(), name, code);
    res.json({ success: true, email: email.toLowerCase(), message: 'Verification code sent to your email.' });
  } catch (err) {
    console.error('Initiate error:', err);
    res.status(500).json({ error: err.message });
  }
});

// ──────────────────────────────────────────
//  STEP 2: VERIFY OTP
// ──────────────────────────────────────────
router.post('/user/verify', async (req, res) => {
  try {
    const { email, code } = req.body;
    if (!email || !code) return res.status(400).json({ error: 'Email and code are required' });

    const { data: user, error: fetchErr } = await supabase
      .from('users')
      .select('id, name, email, verification_code, code_expires_at, is_verified')
      .eq('email', email.toLowerCase())
      .maybeSingle();
    if (fetchErr) throw fetchErr;

    if (!user) return res.status(400).json({ error: 'No account found for this email.' });
    if (user.is_verified) return res.status(400).json({ error: 'This email is already verified.' });

    if (user.code_expires_at && new Date(user.code_expires_at) < new Date()) {
      return res.status(400).json({ error: 'Verification code has expired. Please start again.' });
    }

    if (user.verification_code !== code.toString().trim()) {
      return res.status(400).json({ error: 'Invalid verification code. Please check your email.' });
    }

    // Mark as verified, clear code
    await supabase.from('users').update({
      is_verified: true,
      verification_code: null,
      code_expires_at: null
    }).eq('id', user.id);

    res.json({ success: true, email: user.email, name: user.name, message: 'Email verified! Please set your password.' });
  } catch (err) {
    console.error('Verify error:', err);
    res.status(500).json({ error: err.message });
  }
});

// ──────────────────────────────────────────
//  STEP 3: SET PASSWORD (complete registration)
// ──────────────────────────────────────────
router.post('/user/complete', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'Email and password are required' });
    if (password.length < 8) return res.status(400).json({ error: 'Password must be at least 8 characters.' });

    const { data: user, error: fetchErr } = await supabase
      .from('users')
      .select('id, name, email, is_verified')
      .eq('email', email.toLowerCase())
      .maybeSingle();
    if (fetchErr) throw fetchErr;

    if (!user) return res.status(400).json({ error: 'Account not found.' });
    if (!user.is_verified) return res.status(400).json({ error: 'Email not verified yet.' });

    // Save the password — registration complete
    await supabase.from('users').update({ password }).eq('id', user.id);

    const token = `user_token_${user.id}_${Date.now()}`;
    res.json({
      success: true,
      token,
      user: { id: user.id, name: user.name, email: user.email }
    });
  } catch (err) {
    console.error('Complete error:', err);
    res.status(500).json({ error: err.message });
  }
});

// ──────────────────────────────────────────
//  RESEND OTP
// ──────────────────────────────────────────
router.post('/user/resend-code', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: 'Email is required' });

    const { data: user, error: fetchErr } = await supabase
      .from('users')
      .select('id, name, email, is_verified')
      .eq('email', email.toLowerCase())
      .maybeSingle();
    if (fetchErr) throw fetchErr;
    if (!user) return res.status(404).json({ error: 'No account found.' });
    if (user.is_verified) return res.status(400).json({ error: 'This account is already verified.' });

    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString();

    await supabase.from('users').update({ verification_code: code, code_expires_at: expiresAt }).eq('id', user.id);
    await sendVerificationEmail(user.email, user.name, code);
    res.json({ success: true, message: 'New code sent to your email.' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ──────────────────────────────────────────
//  USER LOGIN
// ──────────────────────────────────────────
router.post('/user/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'Email and password are required' });

    const { data: user, error: fetchErr } = await supabase
      .from('users')
      .select('id, name, email, password, is_verified')
      .eq('email', email.toLowerCase())
      .maybeSingle();
    if (fetchErr) throw fetchErr;

    if (!user || user.password !== password) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    if (!user.is_verified) {
      const code = Math.floor(100000 + Math.random() * 900000).toString();
      const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString();
      await supabase.from('users').update({ verification_code: code, code_expires_at: expiresAt }).eq('id', user.id);
      await sendVerificationEmail(user.email, user.name, code);
      return res.status(403).json({
        error: 'Email not verified. A new code has been sent.',
        requires_verification: true,
        email: user.email
      });
    }

    const token = `user_token_${user.id}_${Date.now()}`;
    res.json({ success: true, token, user: { id: user.id, name: user.name, email: user.email } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
