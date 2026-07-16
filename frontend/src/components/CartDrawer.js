import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiService, getImageUrl } from '../api';

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

  const total = cart.reduce((s, i) => s + i.price * i.quantity, 0);

  const handleCheckout = async (e) => {
    e.preventDefault();
    if (cart.length === 0) {
      showToast('Your cart is empty');
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
        // Concatenate address fields into a single string for backend compatibility
        customer_address: `${form.building}, ${form.street}, ${form.city}, ${form.state}, ${form.zip}, ${form.country}`,
        items: cart
      }, userToken || null);
      
      const dbOrder = orderResponse.order;
      if (!dbOrder || !dbOrder.id) {
        throw new Error('Order creation failed on server');
      }

      // Convert total to paise (1 INR = 100 paise)
      const amountInPaise = Math.round(total * 100);
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
          address: form.address,
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
      
      rzp.on('payment.failed', function (response) {
        console.error('Payment failed:', response.error);
        showToast('Payment failed: ' + response.error.description);
        setLoading(false);
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
    if (loading) return;
    setLoading(true);

    try {
      await apiService.placeCodOrder({
        customer_name: form.name,
        customer_email: form.email,
        customer_address: `${form.building}, ${form.street}, ${form.city}, ${form.state}, ${form.zip}, ${form.country}`,
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
      <div className="cart-drawer" onClick={e => e.stopPropagation()}>
        <div className="cart-header">
          <h3>Shopping Bag ({cart.reduce((s, i) => s + i.quantity, 0)})</h3>
          <button className="close-btn" onClick={closeCart}>×</button>
        </div>

        <div className="cart-items-container">
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
          <div className="cart-summary">
            <div className="summary-row"><span>Subtotal</span><span>₹{total.toFixed(2)}</span></div>
            <div className="summary-row"><span>Delivery</span><span style={{ color: 'var(--color-delivered)', fontWeight: 700 }}>FREE</span></div>
            <div className="summary-row total"><span>Total</span><span>₹{total.toFixed(2)}</span></div>

            <h4 style={{ marginBottom: '0.75rem', fontSize: '0.9rem', fontWeight: 700 }}>Delivery Details</h4>
            {userToken ? (
              <form onSubmit={handleSubmit} className="checkout-form">
                <input type="text" placeholder="Your name" className="form-control" value={form.name} readOnly style={{ opacity: 0.7, cursor: 'not-allowed', background: 'var(--bg-secondary)' }} />
                <input type="email" placeholder="Email address" className="form-control" value={form.email} readOnly style={{ opacity: 0.7, cursor: 'not-allowed', background: 'var(--bg-secondary)' }} />
                {/* Detailed address fields */}
                <input type="text" placeholder="Building / Apartment No." className="form-control" value={form.building} onChange={e => setForm(p => ({ ...p, building: e.target.value }))} required />
                <input type="text" placeholder="Street / Lane" className="form-control" value={form.street} onChange={e => setForm(p => ({ ...p, street: e.target.value }))} required />
                <input type="text" placeholder="City" className="form-control" value={form.city} onChange={e => setForm(p => ({ ...p, city: e.target.value }))} required />
                <input type="text" placeholder="State / Province" className="form-control" value={form.state} onChange={e => setForm(p => ({ ...p, state: e.target.value }))} required />
                <input type="text" placeholder="ZIP / Postal Code" className="form-control" value={form.zip} onChange={e => setForm(p => ({ ...p, zip: e.target.value }))} required />
                <input type="text" placeholder="Country" className="form-control" value={form.country} onChange={e => setForm(p => ({ ...p, country: e.target.value }))} required />

                {/* Payment Method Selector */}
                <div style={{ margin: '0.75rem 0' }}>
                  <label style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-primary)', display: 'block', marginBottom: '0.5rem' }}>Payment Method</label>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button
                      type="button"
                      onClick={() => setPaymentMethod('razorpay')}
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
                    </button>
                    <button
                      type="button"
                      onClick={() => setPaymentMethod('cod')}
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
                    </button>
                  </div>
                </div>

                <button type="submit" className="btn btn-teal w-full" style={{ marginTop: '0.5rem' }} disabled={loading}>
                  {loading
                    ? (paymentMethod === 'cod' ? 'Placing COD Order...' : 'Opening Payment Gateway...')
                    : (paymentMethod === 'cod' ? 'Place COD Order →' : 'Pay & Complete Order →')
                  }
                </button>
              </form>
            ) : (
              <div style={{ marginTop: '1rem', textAlign: 'center', background: 'var(--bg-secondary)', padding: '1rem', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.75rem', fontWeight: 600 }}>
                  Please sign in to place an order.
                </p>
                <button type="button" className="btn btn-teal w-full" onClick={() => { closeCart(); navigate('/login'); }}>
                  Sign In to Checkout →
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
