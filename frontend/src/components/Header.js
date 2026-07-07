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
        {adminToken && <Link to="/admin" className={`nav-link ${pathname.startsWith('/admin') ? 'active' : ''}`} onClick={closeMenu}>Dashboard</Link>}
        
        {/* Mobile-Only Items (Cart & Profile) */}
        {!adminToken && (
          <div className="mobile-only-nav-item" onClick={() => { openCart(); closeMenu(); }}>
            <span style={{ marginRight: '8px' }}>🛒 Cart</span>
            {cartCount > 0 && <span style={{ background: 'var(--brand-purple)', color: '#fff', padding: '2px 6px', borderRadius: '10px', fontSize: '0.7rem' }}>{cartCount}</span>}
          </div>
        )}
        {adminToken ? (
          <div className="mobile-only-nav-item" onClick={() => { onAdminLogout(); navigate('/'); closeMenu(); }} style={{ color: 'var(--color-cancelled)' }}>
            Logout Admin
          </div>
        ) : user ? (
          <>
            <div className="mobile-only-nav-item" onClick={() => { navigate('/profile'); closeMenu(); }} style={{ borderTop: '1px solid #eee', paddingTop: '0.8rem', color: 'var(--brand-purple)' }}>
              👤 Profile Settings ({user.name})
            </div>
            <div className="mobile-only-nav-item" onClick={(e) => { e.stopPropagation(); onUserLogout(); navigate('/'); closeMenu(); }} style={{ color: 'var(--color-cancelled)' }}>
              Logout
            </div>
          </>
        ) : (
          <div className="mobile-only-nav-item" onClick={() => { navigate('/login'); closeMenu(); }} style={{ borderTop: '1px solid #eee', paddingTop: '0.8rem' }}>
            Sign In
          </div>
        )}
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
          <button className="icon-btn cart-btn desktop-only-nav-item" onClick={() => { openCart(); closeMenu(); }} title="Cart" style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
            <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="9" cy="21" r="1"></circle>
              <circle cx="20" cy="21" r="1"></circle>
              <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
            </svg>
            {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
          </button>
        )}

        {adminToken ? (
          <button className="btn btn-sm btn-outline-teal desktop-only-nav-item" onClick={() => { onAdminLogout(); navigate('/'); closeMenu(); }}>
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '4px' }}>
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg> 
            Admin Logout
          </button>
        ) : user ? (
          <div className="profile-dropdown-container desktop-only-nav-item">
            <div className="nav-user-chip" style={{ cursor: 'pointer' }}>
              <div className="nav-user-avatar">{user.name?.[0]?.toUpperCase()}</div>
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="6 9 12 15 18 9"></polyline>
              </svg>
            </div>
            
            <div className="profile-dropdown-menu">
              <div className="profile-dropdown-header">
                <strong>{user.name}</strong>
                <span>{user.email}</span>
              </div>
              <div className="profile-dropdown-body">
                <Link to="/profile" className="profile-dropdown-item" onClick={closeMenu}>Profile & Address</Link>
                <Link to="/profile" className="profile-dropdown-item" onClick={closeMenu}>Purchase History</Link>
                <Link to="/profile" className="profile-dropdown-item" onClick={closeMenu}>Password & Security</Link>
                <button className="profile-dropdown-item" onClick={(e) => { e.stopPropagation(); onUserLogout(); navigate('/'); closeMenu(); }} style={{ color: 'var(--color-cancelled)', width: '100%', textAlign: 'left', background: 'none', border: 'none', cursor: 'pointer', fontSize: 'inherit', padding: '0.8rem 1.2rem' }}>
                  Logout
                </button>
              </div>
            </div>
          </div>
        ) : (
          <Link to="/login" className="btn btn-sm btn-teal desktop-only-nav-item" onClick={closeMenu}>Sign In</Link>
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
