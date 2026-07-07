import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiService } from '../api';
import './AuthPage.css';

// Plain string on purpose — swap for your real photo URL. Because this is a
// JS string (not a CSS url()), webpack never tries to resolve it as a local
// module, so the build can't fail even before you have a real asset here.
const AUTH_BG_IMAGE_URL = '';

function getPasswordStrength(pw) {
  let score = 0;
  if (pw.length >= 8) score++;
  if (/[A-Z]/.test(pw)) score++;
  if (/[0-9]/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;
  return score;
}
const strengthClass = ['', 'strength-weak', 'strength-fair', 'strength-good', 'strength-strong'];
const strengthLabel = ['', 'Weak', 'Fair', 'Good', 'Strong'];

// Basic client-side email sanity check. The server remains the source of truth.
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Small inline eye / eye-off icon so we don't need a new icon dependency. */
function EyeIcon({ off }) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      {off ? (
        <>
          <path d="M17.94 17.94A10.94 10.94 0 0 1 12 20c-7 0-10-8-10-8a18.6 18.6 0 0 1 5.06-5.94M9.9 4.24A10.94 10.94 0 0 1 12 4c7 0 10 8 10 8a18.6 18.6 0 0 1-2.16 3.19" />
          <path d="M14.12 14.12a3 3 0 1 1-4.24-4.24" />
          <path d="M1 1l22 22" />
        </>
      ) : (
        <>
          <path d="M1 12s3-8 11-8 11 8 11 8-3 8-11 8-11-8-11-8Z" />
          <circle cx="12" cy="12" r="3" />
        </>
      )}
    </svg>
  );
}

/** Password field with a show/hide toggle, reused for password + confirm password. */
function PasswordField({ id, label, value, onChange, placeholder, autoComplete, autoFocus, error }) {
  const [visible, setVisible] = useState(false);
  return (
    <div className="form-group">
      <label className="form-label" htmlFor={id}>{label}</label>
      <div style={{ position: 'relative' }}>
        <input
          id={id}
          type={visible ? 'text' : 'password'}
          className="form-control"
          placeholder={placeholder}
          value={value}
          required
          autoFocus={autoFocus}
          autoComplete={autoComplete}
          aria-invalid={!!error}
          onChange={onChange}
          style={{ paddingRight: '2.5rem' }}
        />
        <button
          type="button"
          onClick={() => setVisible(v => !v)}
          aria-label={visible ? `Hide ${label.toLowerCase()}` : `Show ${label.toLowerCase()}`}
          aria-pressed={visible}
          style={{
            position: 'absolute', right: '0.6rem', top: '50%', transform: 'translateY(-50%)',
            background: 'none', border: 'none', padding: 0, cursor: 'pointer',
            color: 'var(--auth-cream-dim)', display: 'flex', alignItems: 'center',
          }}
        >
          <EyeIcon off={visible} />
        </button>
      </div>
    </div>
  );
}

export default function AuthPage({ setUser, setUserToken, showToast }) {
  const navigate = useNavigate();
  const [tab, setTab] = useState('login'); // 'login' | 'signup'

  // Signup steps: 1=name+email, 2=OTP, 3=password
  const [signupStep, setSignupStep] = useState(1);
  const [signupData, setSignupData] = useState({ name: '', email: '' });
  const [otpCode, setOtpCode] = useState('');
  const [verifiedEmail, setVerifiedEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPw, setConfirmPw] = useState('');
  const [resendCooldown, setResendCooldown] = useState(0);

  // Login
  const [loginForm, setLoginForm] = useState({ email: '', password: '' });

  const [error, setError] = useState('');
  const [info, setInfo] = useState('');
  const [loading, setLoading] = useState(false);

  // Move focus to the status message when it changes, so screen reader users
  // and keyboard users immediately know the outcome of an action.
  const statusRef = useRef(null);
  useEffect(() => {
    if ((error || info) && statusRef.current) statusRef.current.focus();
  }, [error, info]);

  // Resend cooldown
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const t = setTimeout(() => setResendCooldown(c => c - 1), 1000);
    return () => clearTimeout(t);
  }, [resendCooldown]);

  const clearMessages = () => { setError(''); setInfo(''); };
  const normalizeEmail = (v) => v.trim().toLowerCase();

  // ── LOGIN ──
  const handleLogin = async (e) => {
    e.preventDefault(); clearMessages();
    const email = normalizeEmail(loginForm.email);
    if (!EMAIL_RE.test(email)) { setError('Enter a valid email address.'); return; }
    setLoading(true);
    try {
      const data = await apiService.userLogin(email, loginForm.password);
      setUser(data.user); setUserToken(data.token);
      localStorage.setItem('whiskwear_user', JSON.stringify(data.user));
      localStorage.setItem('whiskwear_user_token', data.token);
      showToast(`Welcome back, ${data.user.name}! ✦`);
      navigate('/');
    } catch (err) {
      if (err.response?.status === 403 && err.response?.data?.requires_verification) {
        setTab('signup');
        setSignupData({ name: '', email: err.response.data.email });
        setSignupStep(2); setResendCooldown(60);
        if (err.response.data.dev_code) {
          setInfo(`Your email needs verification. Code (dev mode): ${err.response.data.dev_code}`);
        } else {
          setInfo('Your email needs verification. A new code has been sent.');
        }
      } else if (err.response?.status === 429) {
        setError('Too many attempts. Please wait a moment and try again.');
      } else {
        setError(err.response?.data?.error || 'Invalid credentials. Please try again.');
      }
    } finally { setLoading(false); }
  };

  // ── STEP 1: Name + Email ──
  const handleInitiate = async (e) => {
    e.preventDefault(); clearMessages();
    const name = signupData.name.trim();
    const email = normalizeEmail(signupData.email);
    if (name.length < 2) { setError('Enter your full name.'); return; }
    if (!EMAIL_RE.test(email)) { setError('Enter a valid email address.'); return; }
    setSignupData({ name, email });
    setLoading(true);
    try {
      const data = await apiService.userInitiate(name, email);
      setSignupStep(2); setResendCooldown(60);
      if (data.dev_code) {
        setInfo(`Verification code (dev mode): ${data.dev_code}`);
      } else {
        setInfo(`Verification code sent to ${email}`);
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to send code. Try again.');
    } finally { setLoading(false); }
  };

  // ── STEP 2: Verify OTP ──
  const handleVerify = async (e) => {
    e.preventDefault(); clearMessages(); setLoading(true);
    try {
      await apiService.userVerify(signupData.email, otpCode);
      setVerifiedEmail(signupData.email);
      setSignupStep(3); setInfo('Email verified! Set your password to activate your account.');
    } catch (err) {
      setError(err.response?.data?.error || 'Invalid code. Check your email and try again.');
    } finally { setLoading(false); }
  };

  // ── STEP 3: Set Password ──
  const handleComplete = async (e) => {
    e.preventDefault(); clearMessages();
    if (password !== confirmPw) { setError('Passwords do not match.'); return; }
    const strength = getPasswordStrength(password);
    if (strength < 3) { setError('Password is too weak. Use 8+ characters with a number and special character.'); return; }
    setLoading(true);
    try {
      const data = await apiService.userComplete(verifiedEmail, password);
      setUser(data.user); setUserToken(data.token);
      localStorage.setItem('whiskwear_user', JSON.stringify(data.user));
      localStorage.setItem('whiskwear_user_token', data.token);
      showToast(`Welcome to WhiskWear, ${data.user.name}! ✦`);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to complete registration.');
    } finally { setLoading(false); }
  };

  // ── Resend ──
  const handleResend = async () => {
    if (resendCooldown > 0) return;
    clearMessages();
    try {
      const data = await apiService.resendVerificationCode(signupData.email);
      setResendCooldown(60);
      if (data.dev_code) {
        setInfo(`New code (dev mode): ${data.dev_code}`);
      } else {
        setInfo('New code sent to your email.');
      }
    } catch (err) { setError('Failed to resend. Try again.'); }
  };

  const pwStrength = getPasswordStrength(password);
  const pwRules = [
    { label: '8+ characters', ok: password.length >= 8 },
    { label: 'Uppercase letter', ok: /[A-Z]/.test(password) },
    { label: 'Number (0–9)', ok: /[0-9]/.test(password) },
    { label: 'Special character (!@#…)', ok: /[^A-Za-z0-9]/.test(password) },
  ];

  return (
    <div
      className="auth-page-container"
      style={{ '--auth-bg-photo': AUTH_BG_IMAGE_URL ? `url(${AUTH_BG_IMAGE_URL})` : 'none' }}
    >
      {/* Static backdrop photo lives in CSS (.auth-page-container background-image) */}
      <div className="auth-grain" aria-hidden="true" />

      <div className="auth-left-panel">
        <div className="auth-logo-large">
          <img src="https://aoppjuuqdgajcidduqld.supabase.co/storage/v1/object/public/Images/favicon.png" alt="WhiskWear" className="auth-logo-img-large" />
          <div className="auth-logo-text-large">WHISK<span>WEAR</span></div>
        </div>
      </div>
      <div className="auth-card">
        {/* ────── SIGNUP FLOW ────── */}
        {tab === 'signup' ? (
          <>
            {/* Step Indicator */}
            <div className="auth-steps" aria-label={`Step ${signupStep} of 3`}>
              {[1, 2, 3].map((s, i) => (
                <React.Fragment key={s}>
                  <div className={`step-dot ${signupStep === s ? 'active' : signupStep > s ? 'done' : ''}`}>
                    {signupStep > s ? '✓' : s}
                  </div>
                  {i < 2 && <div className={`step-line ${signupStep > s ? 'done' : ''}`} />}
                </React.Fragment>
              ))}
            </div>

            {/* ── Step 1 ── */}
            {signupStep === 1 && (
              <>
                <h2 className="auth-title">Create Account</h2>
                <p className="auth-subtitle">Enter your name and email — we'll send a verification code.</p>
                {error && <div className="auth-alert auth-alert-error" role="alert" tabIndex={-1} ref={statusRef}>{error}</div>}
                <form onSubmit={handleInitiate} className="checkout-form" noValidate>
                  <div className="form-group">
                    <label className="form-label" htmlFor="signup-name">Full Name</label>
                    <input
                      id="signup-name"
                      type="text" className="form-control" placeholder="e.g. YourName"
                      value={signupData.name} required autoFocus maxLength={80}
                      autoComplete="name"
                      onChange={e => setSignupData(p => ({ ...p, name: e.target.value }))}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label" htmlFor="signup-email">Email Address</label>
                    <input
                      id="signup-email"
                      type="email" className="form-control" placeholder="you@example.com"
                      value={signupData.email} required maxLength={254}
                      autoComplete="email"
                      onChange={e => setSignupData(p => ({ ...p, email: e.target.value }))}
                    />
                  </div>
                  <button type="submit" className="btn btn-teal w-full btn-lg" style={{ marginTop: '0.5rem' }} disabled={loading}>
                    {loading ? 'Sending…' : 'Send Activation Code →'}
                  </button>
                </form>
              </>
            )}

            {/* ── Step 2 ── */}
            {signupStep === 2 && (
              <>
                <h2 className="auth-title">Check Your Inbox</h2>
                <p className="auth-subtitle">
                  A 6-digit code was sent to <span className="auth-email-highlight">{signupData.email}</span>
                </p>
                {info && <div className="auth-alert auth-alert-success" role="status" tabIndex={-1} ref={statusRef}>{info}</div>}
                {error && <div className="auth-alert auth-alert-error" role="alert" tabIndex={-1} ref={statusRef}>{error}</div>}
                <form onSubmit={handleVerify} className="checkout-form" noValidate>
                  <div className="form-group">
                    <label className="form-label" htmlFor="otp-code" style={{ textAlign: 'center' }}>Verification Code</label>
                    <input
                      id="otp-code"
                      type="text" maxLength="6"
                      inputMode="numeric" pattern="[0-9]*"
                      autoComplete="one-time-code"
                      className="form-control otp-input"
                      placeholder="• • • • • •"
                      value={otpCode} required autoFocus
                      onChange={e => setOtpCode(e.target.value.replace(/\D/g, ''))}
                    />
                  </div>
                  <button type="submit" className="btn btn-teal w-full btn-lg" style={{ marginTop: '0.5rem' }} disabled={loading || otpCode.length < 6}>
                    {loading ? 'Verifying…' : 'Verify Code →'}
                  </button>
                </form>
                <div className="resend-row">
                  Didn't get it? &nbsp;
                  <button className="resend-btn" onClick={handleResend} disabled={resendCooldown > 0}>
                    {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : 'Resend Code'}
                  </button>
                  &nbsp;·&nbsp;
                  <button
                    type="button"
                    className="resend-btn"
                    onClick={() => { setSignupStep(1); clearMessages(); }}
                  >
                    Wrong email?
                  </button>
                </div>
              </>
            )}

            {/* ── Step 3 ── */}
            {signupStep === 3 && (
              <>
                <h2 className="auth-title">Set Password</h2>
                <p className="auth-subtitle">Almost there! Create a strong password to secure your account.</p>
                {info && <div className="auth-alert auth-alert-success" role="status" tabIndex={-1} ref={statusRef}>{info}</div>}
                {error && <div className="auth-alert auth-alert-error" role="alert" tabIndex={-1} ref={statusRef}>{error}</div>}
                <form onSubmit={handleComplete} className="checkout-form" noValidate>
                  <div className="form-group">
                    <PasswordField
                      id="new-password"
                      label="New Password"
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      placeholder="Minimum 8 characters"
                      autoComplete="new-password"
                      autoFocus
                    />
                    {password && (
                      <>
                        <div className="password-strength" aria-hidden="true">
                          <div className={`password-strength-bar ${strengthClass[pwStrength]}`} />
                        </div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--auth-cream-dim)', marginTop: '0.15rem' }}>
                          {strengthLabel[pwStrength]}
                        </div>
                        <div className="pw-rules">
                          {pwRules.map(r => (
                            <div key={r.label} className={`pw-rule ${r.ok ? 'ok' : ''}`}>
                              <span className="pw-rule-icon">{r.ok ? '✓' : '○'}</span>
                              {r.label}
                            </div>
                          ))}
                        </div>
                      </>
                    )}
                  </div>
                  <PasswordField
                    id="confirm-password"
                    label="Confirm Password"
                    value={confirmPw}
                    onChange={e => setConfirmPw(e.target.value)}
                    placeholder="Repeat your password"
                    autoComplete="new-password"
                    error={confirmPw && password !== confirmPw}
                  />
                  {confirmPw && password !== confirmPw && (
                    <div role="alert" style={{ color: '#fca5a5', fontSize: '0.78rem', marginTop: '-0.5rem', marginBottom: '0.75rem' }}>
                      Passwords don't match
                    </div>
                  )}
                  <button type="submit" className="btn btn-teal w-full btn-lg" style={{ marginTop: '0.5rem' }}
                    disabled={loading || pwStrength < 3 || password !== confirmPw}>
                    {loading ? 'Activating…' : 'Activate My Account ✦'}
                  </button>
                </form>
              </>
            )}

            <div style={{ textAlign: 'center', marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px solid var(--auth-glass-border)' }}>
              <span style={{ color: 'var(--auth-cream-dim)', fontSize: '0.85rem' }}>Already have an account? </span>
              <button
                type="button"
                style={{ background: 'none', border: 'none', color: 'var(--auth-coral)', fontWeight: 700, cursor: 'pointer', fontSize: '0.85rem' }}
                onClick={() => { setTab('login'); clearMessages(); setSignupStep(1); }}
              >Sign In</button>
            </div>
          </>
        ) : (
          /* ────── LOGIN FLOW ────── */
          <>
            {/* Tabs */}
            <div className="auth-tabs" role="tablist">
              <button type="button" role="tab" aria-selected={tab === 'login'} className={`auth-tab ${tab === 'login' ? 'active' : ''}`} onClick={() => { setTab('login'); clearMessages(); }}>
                Sign In
              </button>
              <button type="button" role="tab" aria-selected={tab === 'signup'} className={`auth-tab ${tab === 'signup' ? 'active' : ''}`} onClick={() => { setTab('signup'); clearMessages(); setSignupStep(1); }}>
                Create Account
              </button>
            </div>

            <h2 className="auth-title">Welcome Back</h2>
            <p className="auth-subtitle">Sign in to track your orders, save details, and shop faster.</p>

            {error && <div className="auth-alert auth-alert-error" role="alert" tabIndex={-1} ref={statusRef}>{error}</div>}
            {info && <div className="auth-alert auth-alert-success" role="status" tabIndex={-1} ref={statusRef}>{info}</div>}

            <form onSubmit={handleLogin} className="checkout-form" noValidate>
              <div className="form-group">
                <label className="form-label" htmlFor="login-email">Email Address</label>
                <input
                  id="login-email"
                  type="email" className="form-control" placeholder="you@example.com"
                  value={loginForm.email} required autoFocus
                  autoComplete="email"
                  onChange={e => setLoginForm(p => ({ ...p, email: e.target.value }))}
                />
              </div>
              <PasswordField
                id="login-password"
                label="Password"
                value={loginForm.password}
                onChange={e => setLoginForm(p => ({ ...p, password: e.target.value }))}
                placeholder="Your password"
                autoComplete="current-password"
              />
              <button type="submit" className="btn btn-teal w-full btn-lg" style={{ marginTop: '0.5rem' }} disabled={loading}>
                {loading ? 'Signing in…' : 'Sign In →'}
              </button>
            </form>

            <div style={{ textAlign: 'center', marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px solid var(--auth-glass-border)' }}>
              <span style={{ color: 'var(--auth-cream-dim)', fontSize: '0.85rem' }}>New to WhiskWear? </span>
              <button
                type="button"
                style={{ background: 'none', border: 'none', color: 'var(--auth-coral)', fontWeight: 700, cursor: 'pointer', fontSize: '0.85rem' }}
                onClick={() => { setTab('signup'); clearMessages(); setSignupStep(1); }}
              >Create free account</button>
            </div>
          </>
        )}
        </div>
    </div>
  );
}