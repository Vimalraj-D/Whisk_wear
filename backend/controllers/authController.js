const supabase = require('../config/supabase');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { sendVerificationEmail } = require('../services/emailService');

function generateOtp() {
  return crypto.randomInt(100000, 1000000).toString();
}

exports.adminLogin = async (req, res) => {
  try {
    const { username, password } = req.body;
    const adminUsername = process.env.ADMIN_USERNAME;
    const adminPasswordHash = process.env.ADMIN_PASSWORD_HASH;
    if (!adminUsername || !adminPasswordHash) {
      return res.status(500).json({ error: 'Admin credentials not configured' });
    }
    if (username !== adminUsername) {
      return res.status(401).json({ error: 'Invalid admin credentials' });
    }
    const match = await bcrypt.compare(password, adminPasswordHash);
    if (!match) {
      return res.status(401).json({ error: 'Invalid admin credentials' });
    }
    const token = jwt.sign({ role: 'administrator' }, process.env.ADMIN_JWT_SECRET, { expiresIn: '2h' });
    return res.json({ success: true, token, user: { username: adminUsername, role: 'administrator' } });
  } catch (err) {
    console.error('Admin login error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.initiateSignup = async (req, res) => {
  try {
    const { name, email } = req.body;

    const { data: existing, error: checkErr } = await supabase
      .from('users')
      .select('id, is_verified, password')
      .eq('email', email.toLowerCase())
      .maybeSingle();
    if (checkErr) throw checkErr;

    if (existing && existing.is_verified && existing.password) {
      return res.status(400).json({ error: 'An account with this email already exists. Please log in.' });
    }

    const code = generateOtp();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString();

    if (existing) {
      await supabase.from('users').update({
        name,
        verification_code: code,
        code_expires_at: expiresAt,
        is_verified: false
      }).eq('id', existing.id);
    } else {
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

    sendVerificationEmail(email.toLowerCase(), name, code).catch(err => {
      console.error(`Background verification email failed for ${email}:`, err.message);
    });
    res.json({ success: true, email: email.toLowerCase(), message: 'Verification code sent to your email.' });
  } catch (err) {
    console.error('Initiate error:', err);
    res.status(500).json({ error: err.message });
  }
};

exports.verifyOtp = async (req, res) => {
  try {
    const { email, code } = req.body;

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
};

exports.completeRegistration = async (req, res) => {
  try {
    const { email, password } = req.body;

    const { data: user, error: fetchErr } = await supabase
      .from('users')
      .select('id, name, email, is_verified')
      .eq('email', email.toLowerCase())
      .maybeSingle();
    if (fetchErr) throw fetchErr;

    if (!user) return res.status(400).json({ error: 'Account not found.' });
    if (!user.is_verified) return res.status(400).json({ error: 'Email not verified yet.' });

    const saltRounds = 12;
    const passwordHash = await bcrypt.hash(password, saltRounds);
    await supabase.from('users').update({ password: passwordHash }).eq('id', user.id);

    const token = jwt.sign({ sub: user.id, email: user.email }, process.env.USER_JWT_SECRET, { expiresIn: '1h' });
    res.json({
      success: true,
      token,
      user: { id: user.id, name: user.name, email: user.email }
    });
  } catch (err) {
    console.error('Complete error:', err);
    res.status(500).json({ error: err.message });
  }
};

exports.resendCode = async (req, res) => {
  try {
    const { email } = req.body;

    const { data: user, error: fetchErr } = await supabase
      .from('users')
      .select('id, name, email, is_verified')
      .eq('email', email.toLowerCase())
      .maybeSingle();
    if (fetchErr) throw fetchErr;
    if (!user) return res.status(404).json({ error: 'No account found.' });
    if (user.is_verified) return res.status(400).json({ error: 'This account is already verified.' });

    const code = generateOtp();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString();

    await supabase.from('users').update({ verification_code: code, code_expires_at: expiresAt }).eq('id', user.id);
    sendVerificationEmail(user.email, user.name, code).catch(err => {
      console.error(`Background resend email failed for ${user.email}:`, err.message);
    });
    res.json({ success: true, message: 'New code sent to your email.' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const { data: user, error: fetchErr } = await supabase
      .from('users')
      .select('id, name, email, password, is_verified')
      .eq('email', email.toLowerCase())
      .maybeSingle();
    if (fetchErr) throw fetchErr;

    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    if (!user.is_verified) {
      const code = generateOtp();
      const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString();
      await supabase.from('users').update({ verification_code: code, code_expires_at: expiresAt }).eq('id', user.id);
      sendVerificationEmail(user.email, user.name, code).catch(err => {
        console.error(`Background login verification email failed for ${user.email}:`, err.message);
      });
      return res.status(403).json({
        error: 'Email not verified. A new code has been sent.',
        requires_verification: true,
        email: user.email
      });
    }

    const token = jwt.sign({ sub: user.id, email: user.email }, process.env.USER_JWT_SECRET, { expiresIn: '1h' });
    res.json({ success: true, token, user: { id: user.id, name: user.name, email: user.email } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    const { data: user, error: fetchErr } = await supabase
      .from('users')
      .select('id, name, email')
      .eq('email', email.toLowerCase())
      .maybeSingle();
    if (fetchErr) throw fetchErr;

    if (!user) {
      return res.status(404).json({ error: 'No account found with this email.' });
    }

    const code = generateOtp();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString();

    await supabase.from('users').update({ verification_code: code, code_expires_at: expiresAt }).eq('id', user.id);
    sendVerificationEmail(user.email, user.name, code).catch(err => {
      console.error(`Background forgot-password email failed for ${user.email}:`, err.message);
    });

    res.json({ success: true, message: 'Password reset code sent to your email.' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.resetPassword = async (req, res) => {
  try {
    const { email, code, newPassword } = req.body;

    const { data: user, error: fetchErr } = await supabase
      .from('users')
      .select('id, verification_code, code_expires_at')
      .eq('email', email.toLowerCase())
      .maybeSingle();

    if (fetchErr) throw fetchErr;
    if (!user) return res.status(404).json({ error: 'User not found.' });

    if (user.verification_code !== code) {
      return res.status(400).json({ error: 'Invalid verification code.' });
    }
    if (new Date() > new Date(user.code_expires_at)) {
      return res.status(400).json({ error: 'Verification code has expired.' });
    }

    const saltRounds = 12;
    const newHash = await bcrypt.hash(newPassword, saltRounds);
    await supabase.from('users').update({
      password: newHash,
      verification_code: null,
      code_expires_at: null
    }).eq('id', user.id);

    res.json({ success: true, message: 'Password has been reset successfully.' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getProfile = async (req, res) => {
  try {
    const { userId } = req.params;
    if (String(req.user.id) !== String(userId)) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    const { data: user, error: fetchErr } = await supabase
      .from('users')
      .select('id, name, email, address')
      .eq('id', userId)
      .maybeSingle();

    if (fetchErr) throw fetchErr;
    if (!user) return res.status(404).json({ error: 'User not found.' });

    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const { userId } = req.params;
    if (String(req.user.id) !== String(userId)) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    const { name, address } = req.body;

    const { data: user, error: updateErr } = await supabase
      .from('users')
      .update({ name, address })
      .eq('id', userId)
      .select('id, name, email, address')
      .single();

    if (updateErr) throw updateErr;

    res.json({ success: true, user });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
