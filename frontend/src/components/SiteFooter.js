import React from 'react';

export default function SiteFooter() {
  return (
    <footer className="footer">
      <div className="footer-inner">
        <div className="footer-brand">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
            <img src="https://aoppjuuqdgajcidduqld.supabase.co/storage/v1/object/public/Images/favicon.png" alt="WhiskWear" style={{ width: 28, height: 28, borderRadius: 6, background: 'rgba(255,255,255,0.06)', padding: 3 }} />
            <span className="logo-wordmark" style={{ fontSize: '1rem' }}>WHISK<span>WEAR</span></span>
          </div>
          <p>Premium kitchen cloths and kids' wear crafted with care — built for every family's everyday story.</p>
        </div>
        <div className="footer-col">
          <h4>Collections</h4>
          <ul>
            <li>Kitchen Cloths</li>
            <li>Kids Wear</li>
            <li>New Arrivals</li>
            <li>Best Sellers</li>
          </ul>
        </div>
        <div className="footer-col">
          <h4>Support</h4>
          <ul>
            <li>Track Order</li>
            <li>Returns Policy</li>
            <li>Size Guide</li>
            <li>Contact Us</li>
          </ul>
        </div>
      </div>
      <div className="footer-bottom">
        <span>© {new Date().getFullYear()} <span className="footer-teal">WhiskWear</span>. All rights reserved.</span>
        <span>Kitchen Cloths · Kids Wear · Made with ♥</span>
      </div>
    </footer>
  );
}
