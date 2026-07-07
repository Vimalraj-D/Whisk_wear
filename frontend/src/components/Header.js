import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';

export default function Header({ cartCount, openCart, user, adminToken, onUserLogout, onAdminLogout }) {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const closeMenu = () => setMobileMenuOpen(false);

  return (
    <header className="header">
      {/* Logo */}
      <div className="logo-container" onClick={() => { navigate('/'); closeMenu(); }}>
        <img src="https://aoppjuuqdgajcidduqld.supabase.co/storage/v1/object/public/Images/favicon.png" alt="WhiskWear" className="logo-img" />
        <span className="logo-wordmark">WHISK<span>WEAR</span></span>
      </div>

      {/* Nav Links (Desktop) */}
      <nav className={`nav-links ${mobileMenuOpen ? 'mobile-open' : ''}`}>
        <Link to="/" className={`nav-link ${pathname === '/' ? 'active' : ''}`} onClick={closeMenu}>Home</Link>
        <Link to="/shop" className={`nav-link ${pathname === '/shop' ? 'active' : ''}`} onClick={closeMenu}>Shop</Link>
        <Link to="/collections" className={`nav-link ${pathname === '/collections' ? 'active' : ''}`} onClick={closeMenu}>Collections</Link>
        {user && <Link to="/orders" className={`nav-link ${pathname === '/orders' ? 'active' : ''}`} onClick={closeMenu}>My Orders</Link>}
        {adminToken && <Link to="/admin" className={`nav-link ${pathname.startsWith('/admin') ? 'active' : ''}`} onClick={closeMenu}>Dashboard</Link>}
      </nav>

      {/* Actions */}
      <div className="header-actions">
        {/* Search Icon */}
        <button className="icon-btn search-btn" onClick={() => { navigate('/shop?focus=search'); closeMenu(); }} title="Search" style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          </svg>
        </button>

        {!adminToken && (
          <button className="icon-btn cart-btn" onClick={() => { openCart(); closeMenu(); }} title="Cart" style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
            <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="9" cy="21" r="1"></circle>
              <circle cx="20" cy="21" r="1"></circle>
              <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
            </svg>
            {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
          </button>
        )}

        {adminToken ? (
          <button className="btn btn-sm btn-outline-teal header-btn-desktop" onClick={() => { onAdminLogout(); navigate('/'); closeMenu(); }}>
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '4px' }}>
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg> 
            Admin Logout
          </button>
        ) : user ? (
          <div className="nav-user-chip" onClick={() => { navigate('/orders'); closeMenu(); }}>
            <div className="nav-user-avatar">{user.name?.[0]?.toUpperCase()}</div>
            <span className="nav-user-name header-btn-desktop">{user.name.split(' ')[0]}</span>
            <button
              style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', fontSize: '0.75rem', cursor: 'pointer', marginLeft: '0.4rem', display: 'flex', alignItems: 'center' }}
              onClick={(e) => { e.stopPropagation(); onUserLogout(); navigate('/'); closeMenu(); }}
              title="Logout"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>
        ) : (
          <Link to="/login" className="btn btn-sm btn-teal header-btn-desktop" onClick={closeMenu}>Sign In</Link>
        )}

        {/* Mobile Hamburger Toggle (Right side) */}
        <button className="mobile-menu-toggle" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            {mobileMenuOpen ? (
              <>
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </>
            ) : (
              <>
                <line x1="3" y1="12" x2="21" y2="12"></line>
                <line x1="3" y1="6" x2="21" y2="6"></line>
                <line x1="3" y1="18" x2="21" y2="18"></line>
              </>
            )}
          </svg>
        </button>
      </div>
    </header>
  );
}
