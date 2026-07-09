import React, { useState } from 'react';

export default function SiteFooter() {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (!email) return;
    setSubscribed(true);
    setEmail('');
    setTimeout(() => setSubscribed(false), 4000);
  };

  return (
    <footer className="footer" style={{
      background: 'linear-gradient(180deg, #101524 0%, #080b12 100%)',
      color: '#fff',
      padding: '5rem 8% 2.5rem',
      fontFamily: 'inherit',
      borderTop: '1px solid rgba(255, 255, 255, 0.05)',
      position: 'relative'
    }}>
      {/* Decorative top ambient glow line */}
      <div style={{ position: 'absolute', top: 0, left: '10%', right: '10%', height: '1px', background: 'linear-gradient(90deg, transparent, var(--brand-teal), transparent)', opacity: 0.6 }} />

      <div className="footer-inner">
        {/* Brand Description Column */}
        <div className="footer-brand" style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <img src="https://aoppjuuqdgajcidduqld.supabase.co/storage/v1/object/public/Images/favicon.png" alt="WhiskWear" style={{ width: 34, height: 34, borderRadius: 8, background: 'rgba(255,255,255,0.08)', padding: 4 }} />
            <span className="logo-wordmark" style={{ fontSize: '1.25rem', color: '#fff', fontWeight: 800, letterSpacing: '1px' }}>WHISK<span style={{ color: 'var(--brand-teal)' }}>WEAR</span></span>
          </div>
          <p style={{ color: '#a0a5b5', fontSize: '0.92rem', lineHeight: '1.6', margin: 0 }}>
            Premium kitchen cloths and organic kids' wear crafted with care — built for every family's everyday comfort and style.
          </p>
          {/* Social Links */}
          <div style={{ display: 'flex', gap: '12px', marginTop: '0.5rem' }}>
            <a href="#instagram" className="social-icon-btn" style={socialBtnStyle} aria-label="Instagram">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
            </a>
            <a href="#facebook" className="social-icon-btn" style={socialBtnStyle} aria-label="Facebook">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path></svg>
            </a>
            <a href="#twitter" className="social-icon-btn" style={socialBtnStyle} aria-label="Twitter">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z"></path></svg>
            </a>
            <a href="#pinterest" className="social-icon-btn" style={socialBtnStyle} aria-label="Pinterest">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="2" x2="22" y2="6"></line><path d="M7.5 11.5v-1a4.5 4.5 0 1 1 9 0v1"></path><path d="M12 7.5V14"></path><path d="M7 14h10"></path></svg>
            </a>
          </div>
        </div>

        {/* Collections links */}
        <div className="footer-col" style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
          <h4 style={{ fontSize: '1rem', fontWeight: 700, letterSpacing: '0.5px', color: '#fff', textTransform: 'uppercase', position: 'relative', paddingBottom: '8px', margin: 0 }}>
            Collections
            <span style={colLineStyle} />
          </h4>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <li><a href="/shop?category=kitchen_cloths" className="footer-link" style={linkStyle}>Kitchen Cloths</a></li>
            <li><a href="/shop?category=kids_wear" className="footer-link" style={linkStyle}>Kids Wear</a></li>
            <li><a href="/shop" className="footer-link" style={linkStyle}>New Arrivals</a></li>
            <li><a href="/shop" className="footer-link" style={linkStyle}>Best Sellers</a></li>
          </ul>
        </div>

        {/* Support links */}
        <div className="footer-col" style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
          <h4 style={{ fontSize: '1rem', fontWeight: 700, letterSpacing: '0.5px', color: '#fff', textTransform: 'uppercase', position: 'relative', paddingBottom: '8px', margin: 0 }}>
            Support
            <span style={colLineStyle} />
          </h4>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <li><a href="/profile" className="footer-link" style={linkStyle}>Track Order</a></li>
            <li><a href="/profile" className="footer-link" style={linkStyle}>Returns Policy</a></li>
            <li><a href="/shop" className="footer-link" style={linkStyle}>Size Guide</a></li>
            <li><a href="/profile" className="footer-link" style={linkStyle}>Contact Us</a></li>
          </ul>
        </div>

        {/* Newsletter column */}
        <div className="footer-col" style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
          <h4 style={{ fontSize: '1rem', fontWeight: 700, letterSpacing: '0.5px', color: '#fff', textTransform: 'uppercase', position: 'relative', paddingBottom: '8px', margin: 0 }}>
            Stay In Touch
            <span style={colLineStyle} />
          </h4>
          <p style={{ color: '#a0a5b5', fontSize: '0.9rem', lineHeight: '1.5', margin: 0 }}>
            Subscribe to receive product updates, exclusive deals, and special offers.
          </p>
          <form onSubmit={handleSubscribe} style={{ display: 'flex', width: '100%', position: 'relative', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '25px', overflow: 'hidden', padding: '2px' }}>
            <input 
              type="email" 
              placeholder="Your email address" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={{
                background: 'none',
                border: 'none',
                outline: 'none',
                color: '#fff',
                padding: '0.6rem 1rem',
                fontSize: '0.85rem',
                flex: 1
              }}
              required
            />
            <button 
              type="submit" 
              style={{
                background: 'var(--brand-teal)',
                color: 'var(--brand-navy)',
                border: 'none',
                outline: 'none',
                padding: '0 1.2rem',
                borderRadius: '20px',
                cursor: 'pointer',
                fontWeight: 700,
                fontSize: '0.85rem',
                transition: 'background 0.3s'
              }}
            >
              Join
            </button>
          </form>
          {subscribed && (
            <div style={{ fontSize: '0.8rem', color: 'var(--brand-teal)', animation: 'fadeIn 0.3s ease' }}>
              ✓ Thank you for subscribing!
            </div>
          )}
        </div>
      </div>

      {/* Footer Bottom with payment badges */}
      <div className="footer-bottom-enhanced" style={{
        borderTop: '1px solid rgba(255, 255, 255, 0.08)',
        paddingTop: '2rem',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '1.5rem',
        fontSize: '0.85rem',
        color: '#808595'
      }}>
        <span>© {new Date().getFullYear()} <span style={{ color: 'var(--brand-teal)', fontWeight: 600 }}>WhiskWear</span>. All rights reserved.</span>
        
        {/* Payment logos */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          <span style={{ fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '1px', opacity: 0.8 }}>Secure Checkout:</span>
          <span style={{ fontSize: '1rem', color: '#fff', fontWeight: 600 }}>VISA</span>
          <span style={{ fontSize: '1rem', color: '#fff', fontWeight: 600 }}>Mastercard</span>
          <span style={{ fontSize: '1rem', color: '#fff', fontWeight: 600 }}>UPI</span>
          <span style={{ fontSize: '1rem', color: '#fff', fontWeight: 600 }}>Razorpay</span>
        </div>
      </div>
    </footer>
  );
}

const socialBtnStyle = {
  width: '36px',
  height: '36px',
  borderRadius: '50%',
  background: 'rgba(255,255,255,0.05)',
  border: '1px solid rgba(255,255,255,0.08)',
  color: '#ccc',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  transition: 'all 0.3s ease',
  cursor: 'pointer'
};

const linkStyle = {
  color: '#a0a5b5',
  textDecoration: 'none',
  fontSize: '0.92rem',
  transition: 'color 0.25s ease',
  cursor: 'pointer'
};

const colLineStyle = {
  position: 'absolute',
  bottom: 0,
  left: 0,
  width: '35px',
  height: '2px',
  background: 'var(--brand-teal)'
};
