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
  const [form, setForm] = useState({ name: '', email: '', address: '' });
  const [loading, setLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('razorpay'); // 'razorpay' | 'cod'
  const [checkoutStage, setCheckoutStage] = useState('bag'); // 'bag' | 'checkout'

  useEffect(() => {
    if (!isOpen) {
      setCheckoutStage('bag');
    }
  }, [isOpen]);

  useEffect(() => {
    if (user) setForm(p => ({ ...p, name: user.name || '', email: user.email || '' }));
    else setForm({ name: '', email: '', address: '' });
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
        customer_address: form.address,
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
        customer_address: form.address,
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
        <div className="cart-header" style={{ display: 'flex', flexDirection: 'column', alignItems: 'stretch', gap: '0.75rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
            <h3 style={{ margin: 0 }}>Shopping Bag ({cart.reduce((s, i) => s + i.quantity, 0)})</h3>
            <button className="close-btn" onClick={closeCart}>×</button>
          </div>
          {cart.length > 0 && (
            <div className="checkout-stepper">
              <div className={`checkout-step active`}>
                <span className="checkout-step-num">1</span>
                <span>Bag</span>
              </div>
              <div style={{ flexGrow: 1, height: '1.5px', background: 'var(--border-color)', margin: '0 0.5rem' }}></div>
              <div className={`checkout-step ${checkoutStage === 'checkout' ? 'active' : ''}`}>
                <span className="checkout-step-num">2</span>
                <span>Checkout</span>
              </div>
            </div>
          )}
        </div>

        {checkoutStage === 'bag' ? (
          <>
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
                      {item.selectedSize && <span style={{ fontSize: '0.75rem', background: 'var(--bg-secondary)', padding: '0.1rem 0.35rem', borderRadius: '4px', color: 'var(--text-primary)' }}>Size: {item.selectedSize}</span>}
                      {item.selectedColor && (
                        <span style={{ fontSize: '0.75rem', background: 'var(--bg-secondary)', padding: '0.1rem 0.35rem', borderRadius: '4px', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
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
                <div className="summary-card">
                  <div className="summary-row"><span>Subtotal</span><span>₹{total.toFixed(2)}</span></div>
                  <div className="summary-row"><span>Delivery</span><span style={{ color: 'var(--color-delivered)', fontWeight: 700 }}>FREE</span></div>
                  <div className="summary-row total" style={{ borderTop: '1px solid var(--border-color)', paddingTop: '0.75rem', marginTop: '0.75rem' }}><span>Total</span><span>₹{total.toFixed(2)}</span></div>
                </div>

                {userToken ? (
                  <button type="button" className="btn btn-teal w-full" onClick={() => setCheckoutStage('checkout')} style={{ backgroundColor: 'var(--brand-purple)', color: '#fff', border: 'none' }}>
                    Proceed to Checkout →
                  </button>
                ) : (
                  <div style={{ textAlign: 'center', background: 'var(--bg-secondary)', padding: '1rem', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.75rem', fontWeight: 600 }}>
                      Please sign in to place an order.
                    </p>
                    <button type="button" className="btn btn-teal w-full" onClick={() => { closeCart(); navigate('/login'); }} style={{ backgroundColor: 'var(--brand-purple)', color: '#fff', border: 'none' }}>
                      Sign In to Checkout →
                    </button>
                  </div>
                )}
              </div>
            )}
          </>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', flexGrow: 1, overflowY: 'auto' }}>
            <button 
              type="button" 
              className="btn btn-secondary btn-sm" 
              onClick={() => setCheckoutStage('bag')} 
              style={{ marginBottom: '1.25rem', display: 'inline-flex', alignItems: 'center', gap: '0.25rem', width: 'fit-content', border: '1px solid var(--border-color)', color: 'var(--text-primary)' }}
            >
              ← Back to Bag
            </button>

            <div className="summary-card" style={{ marginBottom: '1.25rem' }}>
              <div style={{ fontSize: '0.85rem', fontWeight: 'bold', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>ORDER SUMMARY</div>
              <div className="summary-row"><span>Items ({cart.reduce((s, i) => s + i.quantity, 0)})</span><span>₹{total.toFixed(2)}</span></div>
              <div className="summary-row"><span>Delivery</span><span style={{ color: 'var(--color-delivered)', fontWeight: 700 }}>FREE</span></div>
              <div className="summary-row total" style={{ borderTop: '1px solid var(--border-color)', paddingTop: '0.5rem', marginTop: '0.5rem', marginBottom: 0 }}><span>Total</span><span>₹{total.toFixed(2)}</span></div>
            </div>

            <h4 style={{ marginBottom: '0.75rem', fontSize: '0.9rem', fontWeight: 700 }}>Delivery Details</h4>
            <form onSubmit={handleSubmit} className="checkout-form">
              <input type="text" placeholder="Your name" className="form-control" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} required />
              <input type="email" placeholder="Email address" className="form-control" value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} required />
              <textarea placeholder="Delivery address" rows="2" className="form-control" value={form.address} onChange={e => setForm(p => ({ ...p, address: e.target.value }))} required />

              {/* Payment Method Selector */}
              <div style={{ margin: '0.5rem 0' }}>
                <label style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-primary)', display: 'block', marginBottom: '0.5rem' }}>Payment Method</label>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('razorpay')}
                    style={{
                      flex: 1,
                      padding: '0.6rem 0.5rem',
                      borderRadius: '10px',
                      border: paymentMethod === 'razorpay' ? '2px solid var(--brand-purple)' : '1.5px solid var(--border-color)',
                      background: paymentMethod === 'razorpay' ? 'var(--brand-teal-lt)' : 'var(--bg-secondary)',
                      color: paymentMethod === 'razorpay' ? 'var(--brand-purple)' : 'var(--text-secondary)',
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
                      border: paymentMethod === 'cod' ? '2px solid var(--brand-purple)' : '1.5px solid var(--border-color)',
                      background: paymentMethod === 'cod' ? 'var(--brand-teal-lt)' : 'var(--bg-secondary)',
                      color: paymentMethod === 'cod' ? 'var(--brand-purple)' : 'var(--text-secondary)',
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

              <button type="submit" className="btn btn-teal w-full" style={{ marginTop: '0.5rem', backgroundColor: 'var(--brand-purple)', color: '#fff', border: 'none' }} disabled={loading}>
                {loading
                  ? (paymentMethod === 'cod' ? 'Placing COD Order...' : 'Opening Payment Gateway...')
                  : (paymentMethod === 'cod' ? 'Place COD Order →' : 'Pay & Complete Order →')
                }
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
