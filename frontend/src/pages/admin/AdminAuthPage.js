import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiService } from '../../api';

export default function AdminAuthPage({ setAdminToken, showToast }) {
  const navigate = useNavigate();
  const [form, setForm] = useState({ username: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault(); setError(''); setLoading(true);
    try {
      const data = await apiService.adminLogin(form.username, form.password);
      setAdminToken(data.token);
      localStorage.setItem('whiskwear_admin_token', data.token);
      showToast('Admin access granted ✦');
      navigate('/admin');
    } catch (err) {
      setError(err.response?.data?.error || 'Invalid credentials');
    } finally { setLoading(false); }
  };

  return (
    <div className="auth-page-container">
      <div className="auth-left-panel">
        <div className="auth-logo-large">
          <img src="https://aoppjuuqdgajcidduqld.supabase.co/storage/v1/object/public/Images/favicon.png" alt="WhiskWear" className="auth-logo-img-large" />
          <div className="auth-logo-text-large">WHISK<span>WEAR</span></div>
        </div>
      </div>
      <div className="auth-card">
        <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
          <div className="admin-badge">🔐 Administrator Portal</div>
          <h2 className="auth-title">Secure Access</h2>
          <p className="auth-subtitle">Enter your admin credentials to open the management console.</p>
        </div>

        {error && <div className="auth-alert auth-alert-error">{error}</div>}

        <form onSubmit={handleSubmit} className="checkout-form">
          <div className="form-group">
            <label className="form-label">Admin Username</label>
            <input type="text" className="form-control" placeholder="admin"
              value={form.username} required autoFocus
              onChange={e => setForm(p => ({ ...p, username: e.target.value }))} />
          </div>
          <div className="form-group">
            <label className="form-label">Secure Password</label>
            <input type="password" className="form-control" placeholder="••••••••"
              value={form.password} required
              onChange={e => setForm(p => ({ ...p, password: e.target.value }))} />
          </div>
          <button type="submit" className="btn btn-primary w-full btn-lg" style={{ marginTop: '0.5rem' }} disabled={loading}>
            {loading ? 'Authenticating…' : 'Open Dashboard →'}
          </button>
        </form>
      </div>
    </div>
  );
}
