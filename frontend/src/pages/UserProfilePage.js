import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiService } from '../api';

export default function UserProfilePage({ user, setUser, showToast, onUserLogout }) {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('profile');
  const [loading, setLoading] = useState(true);

  // Profile Form
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [email, setEmail] = useState('');

  // Security Form (Password Reset)
  const [resetStep, setResetStep] = useState(1); // 1: request, 2: verify
  const [resetEmail, setResetEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');

  // Orders
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    fetchProfile();
    fetchOrders();
    setResetEmail(user.email);
  }, [user, navigate]);

  const fetchProfile = async () => {
    try {
      const res = await fetch(`${process.env.REACT_APP_API_URL || 'https://whisk-wear.onrender.com/api'}/auth/user/profile/${user.id}`);
      if (res.ok) {
        const data = await res.json();
        setName(data.name || '');
        setEmail(data.email || '');
        setAddress(data.address || '');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchOrders = async () => {
    try {
      const data = await apiService.getUserOrders(user.id);
      setOrders(data);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${process.env.REACT_APP_API_URL || 'https://whisk-wear.onrender.com/api'}/auth/user/profile/${user.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, address })
      });
      const data = await res.json();
      if (res.ok) {
        showToast('Profile updated successfully!');
        setUser(data.user);
      } else {
        showToast(data.error || 'Failed to update profile');
      }
    } catch (err) {
      showToast('Error updating profile');
    }
  };

  const handleRequestOtp = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${process.env.REACT_APP_API_URL || 'https://whisk-wear.onrender.com/api'}/auth/user/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: resetEmail })
      });
      const data = await res.json();
      if (res.ok) {
        showToast('OTP sent to your email!');
        setResetStep(2);
      } else {
        showToast(data.error || 'Failed to send OTP');
      }
    } catch (err) {
      showToast('Error sending OTP');
    }
  };

  const handleVerifyReset = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${process.env.REACT_APP_API_URL || 'https://whisk-wear.onrender.com/api'}/auth/user/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: resetEmail, code: otp, newPassword })
      });
      const data = await res.json();
      if (res.ok) {
        showToast('Password reset successful! You can now log in with your new password.');
        setResetStep(1);
        setOtp('');
        setNewPassword('');
      } else {
        showToast(data.error || 'Failed to reset password');
      }
    } catch (err) {
      showToast('Error resetting password');
    }
  };

  if (loading) return <div style={{ padding: '4rem', textAlign: 'center' }}>Loading...</div>;

  return (
    <div className="admin-page-container">
      <div className="admin-sidebar">
        <h2 style={{ padding: '0 1.5rem', marginBottom: '2rem' }}>My Account</h2>
        <nav className="admin-sidebar-nav">
          <button className={`admin-nav-item ${activeTab === 'profile' ? 'active' : ''}`} onClick={() => setActiveTab('profile')}>
            Profile details
          </button>
          <button className={`admin-nav-item ${activeTab === 'orders' ? 'active' : ''}`} onClick={() => setActiveTab('orders')}>
            Purchase History
          </button>
          <button className={`admin-nav-item ${activeTab === 'security' ? 'active' : ''}`} onClick={() => setActiveTab('security')}>
            Security & Password
          </button>
          <button className="admin-nav-item" style={{ color: 'var(--color-cancelled)', marginTop: '2rem' }} onClick={() => { onUserLogout(); navigate('/'); }}>
            Logout
          </button>
        </nav>
      </div>

      <div className="admin-main-content">
        <div className="admin-content-inner" style={{ background: '#fff', borderRadius: '12px', padding: '2rem' }}>
          {activeTab === 'profile' && (
            <div>
              <h3>Profile Details</h3>
              <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>Update your personal information and shipping address.</p>
              
              <form onSubmit={handleUpdateProfile} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', maxWidth: '500px' }}>
                <div className="form-group">
                  <label>Email (Cannot be changed)</label>
                  <input type="email" className="input-field" value={email} disabled style={{ background: '#f5f5f5' }} />
                </div>
                <div className="form-group">
                  <label>Full Name</label>
                  <input type="text" className="input-field" value={name} onChange={e => setName(e.target.value)} required />
                </div>
                <div className="form-group">
                  <label>Default Shipping Address</label>
                  <textarea className="input-field" value={address} onChange={e => setAddress(e.target.value)} rows="4" placeholder="123 Main St, City, State, ZIP..." />
                </div>
                <button type="submit" className="btn btn-teal">Save Changes</button>
              </form>
            </div>
          )}

          {activeTab === 'orders' && (
            <div>
              <h3>Purchase History</h3>
              <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>View your past orders and their status.</p>
              
              <div className="table-responsive">
                {orders.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)' }}>You haven't placed any orders yet.</div>
                ) : (
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>Order ID</th>
                        <th>Date</th>
                        <th>Total Amount</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {orders.map(o => (
                        <tr key={o.id}>
                          <td>#{o.id}</td>
                          <td>{new Date(o.created_at).toLocaleDateString()}</td>
                          <td>${o.total_amount}</td>
                          <td>
                            <span className={`status-badge status-${o.status}`}>{o.status}</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          )}

          {activeTab === 'security' && (
            <div>
              <h3>Security & Password</h3>
              <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>Reset your password via Email OTP.</p>
              
              <div style={{ maxWidth: '400px', background: '#fafafa', padding: '2rem', borderRadius: '12px', border: '1px solid #eee' }}>
                {resetStep === 1 ? (
                  <form onSubmit={handleRequestOtp} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div className="form-group">
                      <label>Email Address</label>
                      <input type="email" className="input-field" value={resetEmail} disabled style={{ background: '#eee' }} />
                    </div>
                    <button type="submit" className="btn btn-teal" style={{ width: '100%' }}>Send Verification Code</button>
                  </form>
                ) : (
                  <form onSubmit={handleVerifyReset} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div className="form-group">
                      <label>Verification Code (OTP)</label>
                      <input type="text" className="input-field" value={otp} onChange={e => setOtp(e.target.value)} required placeholder="123456" />
                    </div>
                    <div className="form-group">
                      <label>New Password</label>
                      <input type="password" className="input-field" value={newPassword} onChange={e => setNewPassword(e.target.value)} required placeholder="Min 6 characters" minLength="6" />
                    </div>
                    <button type="submit" className="btn btn-teal" style={{ width: '100%' }}>Reset Password</button>
                    <button type="button" className="btn btn-outline-teal" style={{ width: '100%', marginTop: '0.5rem' }} onClick={() => setResetStep(1)}>Back</button>
                  </form>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
