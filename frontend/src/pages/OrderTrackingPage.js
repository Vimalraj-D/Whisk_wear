import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { apiService } from '../api';
import OrderTracker from '../components/OrderTracker';

export default function OrderTrackingPage({ userToken, showToast }) {
  const { orderId } = useParams();
  const navigate = useNavigate();
  
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Guest email verification state
  const [guestEmail, setGuestEmail] = useState('');
  const [needsEmailVerification, setNeedsEmailVerification] = useState(false);
  const [verifyingEmail, setVerifyingEmail] = useState(false);

  const fetchOrder = async (emailParam = null) => {
    setLoading(true);
    setError(null);
    try {
      const data = await apiService.getOrderDetails(orderId, emailParam, userToken);
      setOrder(data);
      setNeedsEmailVerification(false);
    } catch (err) {
      console.error(err);
      if (err.response?.status === 403) {
        setNeedsEmailVerification(true);
      } else {
        setError(err.response?.data?.error || err.message || 'Failed to fetch order details');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrder();
  }, [orderId, userToken]);

  const handleVerifyEmailSubmit = async (e) => {
    e.preventDefault();
    if (!guestEmail.trim()) {
      if (showToast) showToast('Please enter your checkout email.');
      return;
    }
    setVerifyingEmail(true);
    try {
      const data = await apiService.getOrderDetails(orderId, guestEmail.trim(), userToken);
      setOrder(data);
      setNeedsEmailVerification(false);
      if (showToast) showToast('Order verified successfully!');
    } catch (err) {
      console.error(err);
      if (showToast) {
        showToast(err.response?.data?.error || 'Email does not match this order.');
      }
    } finally {
      setVerifyingEmail(false);
    }
  };

  if (loading && !verifyingEmail) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', color: 'var(--text-secondary)' }}>
        <div className="spinner" style={{ border: '3px solid #f3f3f3', borderTop: '3px solid var(--brand-purple, #1b4332)', borderRadius: '50%', width: '40px', height: '40px', animation: 'spin 1s linear infinite' }}></div>
        <p style={{ marginTop: '1rem', fontWeight: 600 }}>Loading tracking details...</p>
        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  if (needsEmailVerification) {
    return (
      <div className="auth-container" style={{ padding: '4rem 1.5rem', display: 'flex', justifyContent: 'center', background: '#fafafa' }}>
        <div className="auth-card" style={{ maxWidth: '440px', width: '100%', padding: '2.5rem', background: '#fff', borderRadius: '16px', boxShadow: '0 10px 30px rgba(0,0,0,0.05)', border: '1px solid #f0f0f0' }}>
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <span style={{ fontSize: '2.5rem' }}>🔒</span>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: '1rem', marginBottom: '0.5rem' }}>Guest Order Verification</h2>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>For security, please verify the email address used during checkout to track this order.</p>
          </div>
          
          <form onSubmit={handleVerifyEmailSubmit}>
            <div className="form-group" style={{ marginBottom: '1.5rem' }}>
              <label className="form-label" style={{ fontWeight: 700, fontSize: '0.8rem' }}>Checkout Email Address</label>
              <input 
                type="email" 
                className="form-control" 
                placeholder="e.g. customer@example.com"
                value={guestEmail}
                onChange={e => setGuestEmail(e.target.value)}
                required
                style={{ padding: '0.85rem', borderRadius: '10px' }}
              />
            </div>
            
            <button 
              type="submit" 
              className="btn btn-primary" 
              disabled={verifyingEmail}
              style={{ width: '100%', background: 'var(--brand-purple, #1b4332)', borderColor: 'var(--brand-purple, #1b4332)', padding: '0.85rem', borderRadius: '30px', fontWeight: 700 }}
            >
              {verifyingEmail ? 'Verifying...' : 'Verify & Track Order'}
            </button>
          </form>
          
          <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
            <Link to="/shop" style={{ fontSize: '0.85rem', color: 'var(--brand-teal, #0d9488)', fontWeight: 700, textDecoration: 'none' }}>
              ← Return to Shop
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ maxWidth: '600px', margin: '4rem auto', padding: '2.5rem', textAlign: 'center', border: '1px solid #fee2e2', borderRadius: '16px', background: '#fef2f2', color: '#991b1b' }}>
        <span style={{ fontSize: '3rem' }}>⚠️</span>
        <h3 style={{ fontSize: '1.4rem', fontWeight: 800, margin: '1rem 0 0.5rem 0' }}>Tracking Unavailable</h3>
        <p style={{ fontSize: '0.9rem', color: '#7f1d1d', marginBottom: '2rem' }}>{error}</p>
        <button className="btn btn-secondary" onClick={() => navigate('/shop')} style={{ borderRadius: '30px', padding: '0.75rem 2rem' }}>
          Go to Store
        </button>
      </div>
    );
  }

  const orderItems = order?.order_items || [];
  const fallbackImg = 'https://images.unsplash.com/photo-1590794056226-79ef3a814c2c?w=200';

  return (
    <div className="orders-page-container" style={{ width: '100%', padding: '0.5rem 1rem' }}>
      
      {/* Back navigation */}
      <div style={{ marginBottom: '1.5rem' }}>
        <button 
          onClick={() => {
            if (userToken) navigate('/orders');
            else navigate('/shop');
          }}
          style={{ background: 'none', border: 'none', color: 'var(--brand-teal, #0d9488)', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem', padding: 0 }}
        >
          <span>←</span> Back to {userToken ? 'My Orders' : 'Shop'}
        </button>
      </div>

      <div className="order-details-layout" style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '2rem', width: '85%', margin: '0 auto' }}>
        
        <OrderTracker order={order} showToast={showToast} />
        
        {/* Details Grid: Left: Items, Right: Delivery Card */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '2rem' }}>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '2rem' }}>
            
            {/* Purchase Details */}
        <div style={{ background: '#fff', borderRadius: '4px', border: '1px solid var(--border-color, #e2e8f0)', padding: '1.5rem', boxShadow: '0 4px 20px rgba(0,0,0,0.02)' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800, borderBottom: '1px solid #f0f0f0', paddingBottom: '0.75rem', marginBottom: '1rem', color: 'var(--text-primary)' }}>Items Ordered</h3>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1rem' }}>
                {orderItems.map((item, idx) => {
                  const product = item.products || {};
                  const rate = parseFloat(item.price);
                  const subtotal = rate * parseInt(item.quantity);
                  const imgUrl = product.image_urls && product.image_urls[0] ? product.image_urls[0] : fallbackImg;
                  
                  return (
                    <div key={idx} style={{ display: 'flex', gap: '1.25rem', paddingBottom: idx !== orderItems.length - 1 ? '1rem' : 0, borderBottom: idx !== orderItems.length - 1 ? '1px solid #f5f5f5' : 'none', alignItems: 'center' }}>
                      <img 
                        src={imgUrl} 
                        alt={product.name || 'Product'} 
                        style={{ width: '70px', height: '70px', objectFit: 'cover', borderRadius: '10px', border: '1px solid #eaeaea', background: '#fafafa' }}
                      />
                      <div style={{ flexGrow: 1 }}>
                        <h4 style={{ margin: 0, fontSize: '0.92rem', fontWeight: 700, color: 'var(--text-primary)' }}>{product.name || 'Product Item'}</h4>
                        <p style={{ margin: '0.2rem 0 0 0', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                          ₹{rate.toFixed(2)} × {item.quantity}
                        </p>
                      </div>
                      <div style={{ fontWeight: 800, fontSize: '0.95rem', color: 'var(--brand-purple, #1b4332)' }}>
                        ₹{subtotal.toFixed(2)}
                      </div>
                    </div>
                  );
                })}
              </div>
              
              <div style={{ borderTop: '1px solid #f0f0f0', marginTop: '1.5rem', paddingTop: '1rem', display: 'flex', justifyContent: 'flex-end', fontSize: '0.9rem' }}>
                <table style={{ borderCollapse: 'collapse', width: '220px' }}>
                  <tbody>
                    <tr>
                      <td style={{ padding: '4px 0', color: 'var(--text-secondary)' }}>Subtotal:</td>
                      <td style={{ padding: '4px 0', textAlign: 'right', fontWeight: 600 }}>₹{(parseFloat(order?.total_amount) - parseFloat(order?.shipping_charge || 0)).toFixed(2)}</td>
                    </tr>
                    <tr>
                      <td style={{ padding: '4px 0', color: 'var(--text-secondary)' }}>Shipping:</td>
                      <td style={{ padding: '4px 0', textAlign: 'right', fontWeight: 600 }}>₹{parseFloat(order?.shipping_charge || 0).toFixed(2)}</td>
                    </tr>
                    <tr style={{ borderTop: '1px solid #eaeaea' }}>
                      <td style={{ padding: '8px 0 0 0', color: 'var(--text-primary)', fontWeight: 800 }}>Grand Total:</td>
                      <td style={{ padding: '8px 0 0 0', textAlign: 'right', fontWeight: 800, color: 'var(--brand-purple, #1b4332)', fontSize: '1.1rem' }}>₹{parseFloat(order?.total_amount).toFixed(2)}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
            
          </div>
          
        </div>
        
      </div>
      
    </div>
  );
}
