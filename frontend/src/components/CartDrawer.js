import React, { useState, useEffect } from 'react';
import { apiService, getImageUrl } from '../api';

export default function CartDrawer({ isOpen, closeCart, cart, userToken, user, updateCartQty, removeFromCart, setCart, showToast }) {
  const [form, setForm] = useState({ name: '', email: '', address: '' });

  useEffect(() => {
    if (user) setForm(p => ({ ...p, name: user.name || '', email: user.email || '' }));
    else setForm({ name: '', email: '', address: '' });
  }, [user]);

  const total = cart.reduce((s, i) => s + i.price * i.quantity, 0);

  const handleCheckout = async (e) => {
    e.preventDefault();
    if (cart.length === 0) { showToast('Your cart is empty'); return; }
    try {
      await apiService.placeOrder({ customer_name: form.name, customer_email: form.email, customer_address: form.address, items: cart }, userToken || null);
      showToast('Order placed! Thank you for shopping with WhiskWear ✦');
      setCart([]); closeCart();
    } catch (err) { showToast('Checkout failed: ' + (err.response?.data?.error || err.message)); }
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
            <form onSubmit={handleCheckout} className="checkout-form">
              <input type="text" placeholder="Your name" className="form-control" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} required />
              <input type="email" placeholder="Email address" className="form-control" value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} required />
              <textarea placeholder="Delivery address" rows="2" className="form-control" value={form.address} onChange={e => setForm(p => ({ ...p, address: e.target.value }))} required />
              <button type="submit" className="btn btn-teal w-full" style={{ marginTop: '0.5rem' }}>Complete Order →</button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
