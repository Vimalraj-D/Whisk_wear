import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiService, getImageUrl } from '../api';
import AnimatedButton from './AnimatedButton';

const loadRazorpayScript = () => {
  return new Promise((resolve) => {
    if (window.Razorpay) {
      resolve(true);
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

export default function CartDrawer({ isOpen, closeCart, cart, userToken, user, updateCartQty, removeFromCart, setCart, showToast }) {
  const navigate = useNavigate();
  // Expanded form fields for detailed address (building, street, city, state, zip, country)
  const [form, setForm] = useState({
    name: '',
    email: '',
    building: '',
    street: '',
    city: '',
    state: '',
    zip: '',
    country: ''
  });
  const [loading, setLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('razorpay'); // 'razorpay' | 'cod'

  const [shippingCharge, setShippingCharge] = useState(0);
  const [distance, setDistance] = useState(null);
  const [isCalculatingShipping, setIsCalculatingShipping] = useState(false);

  useEffect(() => {
    if (user) {
      setForm(p => ({
        ...p,
        name: user.name || '',
        email: user.email || ''
      }));
    } else {
      setForm({
        name: '',
        email: '',
        building: '',
        street: '',
        city: '',
        state: '',
        zip: '',
        country: ''
      });
    }
  }, [user]);

  useEffect(() => {
    const cleanZip = String(form.zip).trim();
    if (/^\d{6}$/.test(cleanZip)) {
      const fetchShipping = async () => {
        setIsCalculatingShipping(true);
        try {
          const res = await apiService.getShippingCharge(cleanZip);
          if (res && res.success) {
            setShippingCharge(res.shipping_charge);
            setDistance(res.distance);
          } else {
            setShippingCharge(80);
            setDistance(null);
          }
        } catch (err) {
          console.error('Error fetching shipping charge:', err);
          setShippingCharge(80);
          setDistance(null);
        } finally {
          setIsCalculatingShipping(false);
        }
      };
      fetchShipping();
    } else {
      setShippingCharge(0);
      setDistance(null);
    }
  }, [form.zip]);

  const total = cart.reduce((s, i) => s + i.price * i.quantity, 0);

  const handleCheckout = async (e) => {
    e.preventDefault();
    if (cart.length === 0) {
      showToast('Your cart is empty');
      return;
    }
    if (!/^\d{6}$/.test(String(form.zip).trim())) {
      showToast('Please enter a valid 6-digit ZIP / Postal Code');
      return;
    }
    if (loading) return;

    setLoading(true);

    const scriptLoaded = await loadRazorpayScript();
    if (!scriptLoaded) {
      showToast('Failed to load Razorpay SDK. Are you offline?');
      setLoading(false);
      return;
    }

    try {
      // 1. Create order in the local database (status: pending)
      const orderResponse = await apiService.placeOrder({
        customer_name: form.name,
        customer_email: form.email,
        customer_address: `${form.building}, ${form.street}, ${form.city}, ${form.state}, ${form.zip}, ${form.country}`,
        zip: form.zip,
        items: cart
      }, userToken || null);
      
      const dbOrder = orderResponse.order;
      if (!dbOrder || !dbOrder.id) {
        throw new Error('Order creation failed on server');
      }

      // Convert total to paise (1 INR = 100 paise) including shipping charge
      const amountInPaise = Math.round((total + shippingCharge) * 100);
      if (amountInPaise < 100) {
        showToast('Order amount must be at least ₹1.00');
        setLoading(false);
        return;
      }

      // 2. Create order in Razorpay
      const rpOrder = await apiService.createRazorpayOrder(amountInPaise, dbOrder.id);
      
      // 3. Configure and open Razorpay Checkout Modal
      const options = {
        key: process.env.REACT_APP_RAZORPAY_KEY_ID,
        amount: rpOrder.amount,
        currency: rpOrder.currency || "INR",
        name: "WhiskWear",
        description: `Order #${dbOrder.id} Payment`,
        image: "https://images.unsplash.com/photo-1590794056226-79ef3a814c2c?w=100", // Placeholder or logo image
        order_id: rpOrder.order_id,
        handler: async function (response) {
          try {
            // 4. Verify signature on successful payment
            await apiService.verifyPayment({
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_signature: response.razorpay_signature,
              order_id: dbOrder.id
            });

            showToast('Payment successful! Thank you for shopping with WhiskWear ✦');
            setCart([]);
            closeCart();
          } catch (verifyErr) {
            showToast('Payment verification failed: ' + (verifyErr.response?.data?.error || verifyErr.message));
          } finally {
            setLoading(false);
          }
        },
        prefill: {
          name: form.name,
          email: form.email,
        },
        notes: {
          address: `${form.building}, ${form.street}, ${form.city}, ${form.state}, ${form.zip}, ${form.country}`,
          db_order_id: dbOrder.id.toString()
        },
        theme: {
          color: "#0d9488" // Teal color to match theme
        },
        modal: {
          ondismiss: async function () {
            console.log('Payment modal closed by user');
            showToast('Payment cancelled');
            try {
              // 5. Cancel order and restore stock if user cancelled checkout
              await apiService.cancelOrder(dbOrder.id);
            } catch (cancelErr) {
              console.error('Failed to cancel order on modal close:', cancelErr);
            } finally {
              setLoading(false);
            }
          }
        }
      };

      const rzp = new window.Razorpay(options);
      
      rzp.on('payment.failed', async function (response) {
        console.error('Payment failed:', response.error);
        showToast('Payment failed: ' + (response.error?.description || 'Transaction failed'));
        try {
          await apiService.cancelOrder(dbOrder.id);
        } catch (cancelErr) {
          console.error('Failed to cancel order on payment failure:', cancelErr);
        } finally {
          setLoading(false);
        }
      });

      rzp.open();
    } catch (err) {
      showToast('Checkout failed: ' + (err.response?.data?.error || err.message));
      setLoading(false);
    }
  };

  const handleCodCheckout = async (e) => {
    e.preventDefault();
    if (cart.length === 0) {
      showToast('Your cart is empty');
      return;
    }
    if (!/^\d{6}$/.test(String(form.zip).trim())) {
      showToast('Please enter a valid 6-digit ZIP / Postal Code');
      return;
    }
    if (loading) return;
    setLoading(true);

    try {
      await apiService.placeCodOrder({
        customer_name: form.name,
        customer_email: form.email,
        customer_address: `${form.building}, ${form.street}, ${form.city}, ${form.state}, ${form.zip}, ${form.country}`,
        zip: form.zip,
        items: cart
      }, userToken || null);

      showToast('COD Order placed! Confirmation email sent ✦');
      setCart([]);
      closeCart();
    } catch (err) {
      showToast('COD order failed: ' + (err.response?.data?.error || err.message));
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e) => {
    if (paymentMethod === 'cod') {
      handleCodCheckout(e);
    } else {
      handleCheckout(e);
    }
  };

  return (
    <div className={`cart-overlay ${isOpen ? 'open' : ''}`} onClick={closeCart}>
      <div className="cart-drawer" style={{ display: 'flex', flexDirection: 'column', height: '100%', padding: '1.5rem 1.5rem 1rem 1.5rem' }} onClick={e => e.stopPropagation()}>
        <div className="cart-header" style={{ marginBottom: '1rem', flexShrink: 0 }}>
          <h3>Shopping Bag ({cart.reduce((s, i) => s + i.quantity, 0)})</h3>
          <button className="close-btn" onClick={closeCart}>×</button>
        </div>

        {/* Scrollable Container for Items and Checkout Details */}
        <div className="cart-drawer-body" style={{ flexGrow: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1.5rem', paddingRight: '0.25rem' }}>
          <div className="cart-items-container" style={{ overflowY: 'visible', flexGrow: 0, marginBottom: 0 }}>
            {cart.length === 0 ? (
              <div style={{ textAlign: 'center', marginTop: '4rem', color: 'var(--text-secondary)' }}>
                <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🛍️</div>
                <p>Your bag is empty</p>
              </div>
            ) : cart.map((item, idx) => (
              <div key={`${item.product_id}-${item.selectedSize}-${item.selectedColor}-${idx}`} className="cart-item">
                <img src={getImageUrl(item.image_url)} alt={item.name} className="cart-item-img" />
                <div className="cart-item-details">
                  <div className="cart-item-name">{item.name}</div>
                  <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', margin: '0.15rem 0' }}>
                    {item.selectedSize && <span style={{ fontSize: '0.75rem', background: '#f1f2f6', padding: '0.1rem 0.35rem', borderRadius: '4px', color: '#2f3542' }}>Size: {item.selectedSize}</span>}
                    {item.selectedColor && (
                      <span style={{ fontSize: '0.75rem', background: '#f1f2f6', padding: '0.1rem 0.35rem', borderRadius: '4px', color: '#2f3542', display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                        Color: <span style={{ display: 'inline-block', width: '10px', height: '10px', borderRadius: '50%', backgroundColor: item.selectedColor }} />
                      </span>
                    )}
                  </div>
                  <div className="cart-item-price">₹{parseFloat(item.price).toFixed(2)}</div>
                  <div className="cart-item-qty">
                    <button className="qty-btn" onClick={() => updateCartQty(item.product_id, item.selectedSize, item.selectedColor, -1, 999)}>−</button>
                    <span className="qty-val">{item.quantity}</span>
                    <button className="qty-btn" onClick={() => updateCartQty(item.product_id, item.selectedSize, item.selectedColor, 1, 999)}>+</button>
                  </div>
                  <button className="cart-item-remove" onClick={() => removeFromCart(item.product_id, item.selectedSize, item.selectedColor)}>Remove</button>
                </div>
              </div>
            ))}
          </div>

          {cart.length > 0 && (
            <div className="cart-summary" style={{ borderTop: '1px solid var(--border-color)', paddingTop: '1.25rem' }}>
              <div className="summary-row"><span>Subtotal</span><span>₹{total.toFixed(2)}</span></div>
              <div className="summary-row">
                <span>Delivery</span>
                <span style={{ fontWeight: 700 }}>
                  {isCalculatingShipping ? (
                    <span style={{ color: 'var(--text-secondary)', fontStyle: 'italic', fontSize: '0.85rem' }}>Calculating...</span>
                  ) : !/^\d{6}$/.test(form.zip) ? (
                    <span style={{ color: '#e17055', fontSize: '0.85rem' }}>Enter 6-digit PIN</span>
                  ) : (
                    <span style={{ color: 'var(--brand-teal)' }}>
                      ₹{shippingCharge.toFixed(2)}
                    </span>
                  )}
                </span>
              </div>
              <div className="summary-row total">
                <span>Total</span>
                <span>₹{(total + shippingCharge).toFixed(2)}</span>
              </div>

              <h4 style={{ marginBottom: '0.75rem', fontSize: '0.9rem', fontWeight: 700 }}>Delivery Details</h4>
              {userToken ? (
                <form onSubmit={handleSubmit} className="checkout-form">
                  <input type="text" placeholder="Your name" className="form-control" value={form.name} readOnly style={{ opacity: 0.7, cursor: 'not-allowed', background: 'var(--bg-secondary)' }} />
                  <input type="email" placeholder="Email address" className="form-control" value={form.email} readOnly style={{ opacity: 0.7, cursor: 'not-allowed', background: 'var(--bg-secondary)' }} />
                  {/* Detailed address fields */}
                  <div className="floating-group">
                    <input type="text" id="cart-building" placeholder=" " className="floating-input" value={form.building} onChange={e => setForm(p => ({ ...p, building: e.target.value }))} required />
                    <label htmlFor="cart-building" className="floating-label">Building / Apartment No.</label>
                  </div>
                  <div className="floating-group">
                    <input type="text" id="cart-street" placeholder=" " className="floating-input" value={form.street} onChange={e => setForm(p => ({ ...p, street: e.target.value }))} required />
                    <label htmlFor="cart-street" className="floating-label">Street / Lane</label>
                  </div>
                  <div className="floating-group">
                    <input type="text" id="cart-city" placeholder=" " className="floating-input" value={form.city} onChange={e => setForm(p => ({ ...p, city: e.target.value }))} required />
                    <label htmlFor="cart-city" className="floating-label">City</label>
                  </div>
                  <div className="floating-group">
                    <input type="text" id="cart-state" placeholder=" " className="floating-input" value={form.state} onChange={e => setForm(p => ({ ...p, state: e.target.value }))} required />
                    <label htmlFor="cart-state" className="floating-label">State / Province</label>
                  </div>
                  <div className="floating-group">
                    <input 
                      type="text" 
                      id="cart-zip"
                      maxLength={6} 
                      placeholder=" " 
                      className="floating-input" 
                      value={form.zip} 
                      onChange={e => {
                        const val = e.target.value.replace(/\D/g, '');
                        setForm(p => ({ ...p, zip: val }));
                      }} 
                      required 
                    />
                    <label htmlFor="cart-zip" className="floating-label">ZIP / Postal Code (6 digits)</label>
                  </div>
                  <div className="floating-group">
                    <input type="text" id="cart-country" placeholder=" " className="floating-input" value={form.country} onChange={e => setForm(p => ({ ...p, country: e.target.value }))} required />
                    <label htmlFor="cart-country" className="floating-label">Country</label>
                  </div>

                  {/* Payment Method Selector */}
                  <div style={{ margin: '1.25rem 0' }}>
                    <label style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-primary)', display: 'block', marginBottom: '0.5rem' }}>Payment Method</label>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <AnimatedButton
                        type="button"
                        onClick={() => setPaymentMethod('razorpay')}
                        className="ripple-button"
                        style={{
                          flex: 1,
                          padding: '0.6rem 0.5rem',
                          borderRadius: '10px',
                          border: paymentMethod === 'razorpay' ? '2px solid var(--brand-teal)' : '1.5px solid var(--border-color)',
                          background: paymentMethod === 'razorpay' ? 'rgba(13,148,136,0.08)' : 'var(--bg-secondary)',
                          color: paymentMethod === 'razorpay' ? 'var(--brand-teal)' : 'var(--text-secondary)',
                          cursor: 'pointer',
                          fontWeight: 700,
                          fontSize: '0.8rem',
                          transition: 'all 0.2s ease',
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          gap: '0.25rem'
                        }}
                      >
                        <span style={{ fontSize: '1.2rem' }}>💳</span>
                        <span>Pay Online</span>
                        <span style={{ fontSize: '0.65rem', fontWeight: 400, opacity: 0.7 }}>UPI / Card / Net Banking</span>
                      </AnimatedButton>
                      <AnimatedButton
                        type="button"
                        onClick={() => setPaymentMethod('cod')}
                        className="ripple-button"
                        style={{
                          flex: 1,
                          padding: '0.6rem 0.5rem',
                          borderRadius: '10px',
                          border: paymentMethod === 'cod' ? '2px solid var(--brand-teal)' : '1.5px solid var(--border-color)',
                          background: paymentMethod === 'cod' ? 'rgba(13,148,136,0.08)' : 'var(--bg-secondary)',
                          color: paymentMethod === 'cod' ? 'var(--brand-teal)' : 'var(--text-secondary)',
                          cursor: 'pointer',
                          fontWeight: 700,
                          fontSize: '0.8rem',
                          transition: 'all 0.2s ease',
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          gap: '0.25rem'
                        }}
                      >
                        <span style={{ fontSize: '1.2rem' }}>🏠</span>
                        <span>Cash on Delivery</span>
                        <span style={{ fontSize: '0.65rem', fontWeight: 400, opacity: 0.7 }}>Pay when delivered</span>
                      </AnimatedButton>
                    </div>
                  </div>

                  <AnimatedButton type="submit" className="btn btn-teal w-full ripple-button" style={{ marginTop: '0.5rem' }} disabled={loading}>
                    {loading
                      ? (paymentMethod === 'cod' ? 'Placing COD Order...' : 'Opening Payment Gateway...')
                      : (paymentMethod === 'cod' ? 'Place COD Order →' : 'Pay & Complete Order →')
                    }
                  </AnimatedButton>
                </form>
              ) : (
                <div style={{ marginTop: '1rem', textAlign: 'center', background: 'var(--bg-secondary)', padding: '1rem', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.75rem', fontWeight: 600 }}>
                    Please sign in to place an order.
                  </p>
                  <AnimatedButton type="button" className="btn btn-teal w-full ripple-button" onClick={() => { closeCart(); navigate('/login'); }}>
                    Sign In to Checkout →
                  </AnimatedButton>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
