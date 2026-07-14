import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';

export default function Header({ cartCount, openCart, user, adminToken, onUserLogout, onAdminLogout }) {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  // Animated Search Bar state
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);

  // Dark Mode state initialized from local storage or system preference
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem('theme');
    if (saved) return saved === 'dark';
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  // Apply dark mode theme class to document body on state change
  useEffect(() => {
    if (darkMode) {
      document.body.classList.add('dark-mode');
      localStorage.setItem('theme', 'dark');
    } else {
      document.body.classList.remove('dark-mode');
      localStorage.setItem('theme', 'light');
    }
  }, [darkMode]);

  const closeMenu = () => setMobileMenuOpen(false);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/shop?search=${encodeURIComponent(searchQuery.trim())}`);
      setIsSearchExpanded(false);
      setSearchQuery('');
    }
  };

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
          <div className="nav-link mobile-only" onClick={() => { openCart(); closeMenu(); }}>
            🛒 Cart {cartCount > 0 && <span className="cart-badge-inline">{cartCount}</span>}
          </div>
        )}
        {adminToken ? (
          <div className="nav-link mobile-only logout-link" onClick={() => { onAdminLogout(); navigate('/'); closeMenu(); }}>
            Logout Admin
          </div>
        ) : user ? (
          <>
            <div className="nav-link mobile-only profile-link" onClick={() => { navigate('/profile'); closeMenu(); }}>
              👤 Profile Settings
            </div>
            <div className="nav-link mobile-only logout-link" onClick={(e) => { e.stopPropagation(); onUserLogout(); navigate('/'); closeMenu(); }}>
              Logout
            </div>
          </>
        ) : (
          <div className="nav-link mobile-only" onClick={() => { navigate('/login'); closeMenu(); }}>
            👤 Sign In
          </div>
        )}
      </nav>

      {/* Actions */}
      <div className="header-actions">
        {/* Animated Expandable Search Bar */}
        <form 
          onSubmit={handleSearchSubmit} 
          className={`search-bar-container ${isSearchExpanded ? 'expanded' : ''}`}
          onMouseEnter={() => setIsSearchExpanded(true)}
          onMouseLeave={() => { if (!searchQuery) setIsSearchExpanded(false); }}
        >
          <button type="submit" className="search-bar-btn" title="Search">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
          </button>
          <input
            type="text"
            className="search-bar-input"
            placeholder="Search clothing..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => setIsSearchExpanded(true)}
            onBlur={() => { if (!searchQuery) setIsSearchExpanded(false); }}
          />
        </form>

        {/* Theme Toggle Button */}
        <button 
          className="theme-toggle-btn" 
          onClick={() => setDarkMode(!darkMode)} 
          title={darkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
        >
          {darkMode ? (
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="5"></circle>
              <line x1="12" y1="1" x2="12" y2="3"></line>
              <line x1="12" y1="21" x2="12" y2="23"></line>
              <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
              <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
              <line x1="1" y1="12" x2="3" y2="12"></line>
              <line x1="21" y1="12" x2="23" y2="12"></line>
              <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
              <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
            </svg>
          )}
        </button>

        {!adminToken && (
          <button className="icon-btn cart-btn desktop-only-nav-item" onClick={() => { openCart(); closeMenu(); }} title="Cart" style={{ position: 'relative' }}>
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
          <Link to="/login" className="btn btn-sm btn-teal desktop-only-nav-item" onClick={closeMenu} style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
              <circle cx="12" cy="7" r="4"></circle>
            </svg>
            Sign In
          </Link>
        )}

        {/* Mobile Hamburger Toggle (Right side) */}
        <button className="mobile-menu-toggle" onClick={() => setMobileMenuOpen(!mobileMenuOpen)} style={{ padding: '4px' }}>
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            {mobileMenuOpen ? (
              <>
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </>
            ) : (
              <>
                {/* Creative artistic menu button with asymmetric lines and dot */}
                <line x1="4" y1="6" x2="16" y2="6"></line>
                <line x1="4" y1="12" x2="20" y2="12"></line>
                <line x1="4" y1="18" x2="12" y2="18"></line>
                <circle cx="18" cy="18" r="2" fill="currentColor"></circle>
              </>
            )}
          </svg>
        </button>
      </div>
    </header>
  );
}
