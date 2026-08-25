import React, { useState, useEffect, useCallback, lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { SpeedInsights } from '@vercel/speed-insights/react';

// Components (loaded eagerly — small, needed on every page)
import Header from './components/Header';
import SiteFooter from './components/SiteFooter';
import CartDrawer from './components/CartDrawer';
import WishlistModal from './components/WishlistModal';
import CategoryTicker from './components/CategoryTicker';

// Pages (lazy-loaded per route for code splitting)
const HomePage = lazy(() => import('./pages/HomePage'));
const ShopPage = lazy(() => import('./pages/ShopPage'));
const CollectionsPage = lazy(() => import('./pages/CollectionsPage'));
const AuthPage = lazy(() => import('./pages/AuthPage'));
const OrdersPage = lazy(() => import('./pages/OrdersPage'));
const UserProfilePage = lazy(() => import('./pages/UserProfilePage'));
const ProductDetailPage = lazy(() => import('./pages/ProductDetailPage'));
const OrderTrackingPage = lazy(() => import('./pages/OrderTrackingPage'));

// Admin Pages (lazy-loaded — only needed for admin routes)
const AdminAuthPage = lazy(() => import('./pages/admin/AdminAuthPage'));
const AdminLayout = lazy(() => import('./pages/admin/AdminLayout'));

function isTokenExpired(token) {
  if (!token) return true;
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return true;
    const payload = JSON.parse(atob(parts[1].replace(/-/g, '+').replace(/_/g, '/')));
    if (!payload.exp) return false;
    return payload.exp * 1000 < Date.now();
  } catch {
    return true;
  }
}

const triggerFlyToCart = (product, event) => {
  const cartIcon = document.querySelector('.cart-btn');
  if (!cartIcon) return;

  const clickEvent = event || window.event;
  const target = clickEvent ? (clickEvent.target || clickEvent.srcElement) : null;
  const button = target ? target.closest('button') : null;

  let srcElement = null;

  if (button) {
    // Check if we're on the Product Detail page (button inside .buy-box-card)
    const buyBox = button.closest('.buy-box-card');
    if (buyBox) {
      // The main product image is NOT inside the buy-box — it's in a sibling column.
      // Look for it globally on the page.
      srcElement = document.querySelector('.product-detail-main-image img');
    }

    // If not found yet, try standard card containers
    if (!srcElement) {
      const card = button.closest('.premium-product-card') ||
                   button.closest('.product-card') || 
                   button.closest('.wishlist-modal-item') || 
                   button.closest('.modal-content') || 
                   button.closest('.wishlist-item') || 
                   button.closest('.premium-product-card-vertical') || 
                   button.closest('.premium-list-item');
      if (card) {
        srcElement = card.querySelector('img');
      }
    }
  }

  // Fallback to button itself if no image found anywhere
  if (!srcElement) {
    srcElement = button;
  }

  if (!srcElement) return;

  const startRect = srcElement.getBoundingClientRect();
  const endRect = cartIcon.getBoundingClientRect();

  // Create flyer element matching the exact image size and position at start
  const flyer = document.createElement('div');
  flyer.className = 'add-to-cart-flyer';
  flyer.style.position = 'fixed';
  flyer.style.top = `${startRect.top}px`;
  flyer.style.left = `${startRect.left}px`;
  flyer.style.width = `${startRect.width}px`;
  flyer.style.height = `${startRect.height}px`;
  flyer.style.zIndex = '999999';
  flyer.style.pointerEvents = 'none';
  flyer.style.backgroundColor = '#fff';
  flyer.style.border = '1px solid var(--border-color, #e2e8f0)';
  flyer.style.borderRadius = '12px';
  flyer.style.boxShadow = '0 10px 25px rgba(0, 0, 0, 0.15)';
  flyer.style.overflow = 'hidden';
  flyer.style.display = 'flex';
  flyer.style.alignItems = 'center';
  flyer.style.justifyContent = 'center';

  if (srcElement.tagName === 'IMG') {
    const img = document.createElement('img');
    img.src = srcElement.src;
    img.style.width = '100%';
    img.style.height = '100%';
    img.style.objectFit = 'cover';
    flyer.appendChild(img);
  } else {
    flyer.textContent = srcElement.textContent || '✓';
    flyer.style.color = '#fff';
    flyer.style.fontSize = '0.75rem';
    flyer.style.fontWeight = 'bold';
    flyer.style.backgroundColor = 'var(--brand-teal, #0d9488)';
    flyer.style.borderRadius = '20px';
  }

  document.body.appendChild(flyer);

  // Calculate center coordinates
  const startCenterX = startRect.left + startRect.width / 2;
  const startCenterY = startRect.top + startRect.height / 2;
  const endCenterX = endRect.left + endRect.width / 2;
  const endCenterY = endRect.top + endRect.height / 2;

  // Parabolic Bezier control point (arcs upward first like a basketball shot)
  const distanceX = Math.abs(endCenterX - startCenterX);
  const peakHeightOffset = Math.max(180, distanceX * 0.35);
  const controlX = (startCenterX + endCenterX) / 2;
  const controlY = Math.min(startCenterY, endCenterY) - peakHeightOffset;

  const duration = 1200; // 1.2s total flight
  const startTime = performance.now();

  // Immediately start expanding the cart icon (grows in sync with flight)
  cartIcon.style.transition = 'none';
  cartIcon.style.zIndex = '10000';
  cartIcon.style.position = 'relative';

  const animateFrame = (now) => {
    const elapsed = now - startTime;
    const p = Math.min(1, elapsed / duration); // Linear progress [0, 1]

    // Gravity-like timing: fast launch, hang near peak, accelerate down
    let t = p + 0.12 * Math.sin(2 * Math.PI * p);

    // Slow down vertical descent in the final 15% (basketball settling into net)
    if (p > 0.85) {
      const landingProgress = (p - 0.85) / 0.15; // 0 → 1 over last 15%
      const easeOut = 1 - Math.pow(1 - landingProgress, 2); // ease-out curve
      t = t * (1 - 0.08 * (1 - easeOut)); // slightly decelerate the final approach
    }

    // Compute quadratic Bezier path point
    const curX = (1 - t) * (1 - t) * startCenterX + 2 * (1 - t) * t * controlX + t * t * endCenterX;
    const curY = (1 - t) * (1 - t) * startCenterY + 2 * (1 - t) * t * controlY + t * t * endCenterY;

    // Translation relative to starting position
    const tx = curX - startCenterX;
    const ty = curY - startCenterY;

    // Shrink progressively from 1.0 to 0.2 — NO rotation
    const curScale = 1.0 - 0.8 * p;

    // Opacity: stays 1.0 until 85%, then fades in last 15%
    let curOpacity = 1.0;
    if (p > 0.85) {
      curOpacity = 1.0 - ((p - 0.85) / 0.15) * 0.95;
    }

    // Cart icon expansion: grows from 1.0 to 2.0 in sync with flight progress
    // Uses ease-in curve so it grows faster as the product approaches
    const cartExpand = 1.0 + Math.pow(p, 1.5); // 1.0 at start → 2.0 at landing
    cartIcon.style.transform = `scale(${cartExpand})`;

    // Apply flyer transform — NO rotate()
    flyer.style.transform = `translate(${tx}px, ${ty}px) scale(${curScale})`;
    flyer.style.opacity = curOpacity;

    if (p < 1) {
      requestAnimationFrame(animateFrame);
    } else {
      // === LANDING ===
      flyer.remove();

      // Create subtle "swish" ripple at cart icon position
      const ripple = document.createElement('div');
      ripple.style.position = 'fixed';
      ripple.style.top = `${endRect.top + endRect.height / 2 - 20}px`;
      ripple.style.left = `${endRect.left + endRect.width / 2 - 20}px`;
      ripple.style.width = '40px';
      ripple.style.height = '40px';
      ripple.style.borderRadius = '50%';
      ripple.style.border = '2px solid var(--brand-teal, #0d9488)';
      ripple.style.opacity = '0.6';
      ripple.style.zIndex = '999998';
      ripple.style.pointerEvents = 'none';
      ripple.style.transition = 'all 300ms ease-out';
      document.body.appendChild(ripple);
      requestAnimationFrame(() => {
        ripple.style.transform = 'scale(2.5)';
        ripple.style.opacity = '0';
      });
      setTimeout(() => ripple.remove(), 300);

      // Shrink cart icon from 2x back to 1x with smooth CSS transition
      cartIcon.style.transition = 'transform 300ms ease-in-out';
      cartIcon.style.transform = 'scale(1)';

      // After shrink-back completes, trigger the confirmation bump + badge pop
      setTimeout(() => {
        // Clean up inline styles so CSS keyframes can take over
        cartIcon.style.transition = '';
        cartIcon.style.transform = '';
        cartIcon.style.zIndex = '';
        cartIcon.style.position = '';

        cartIcon.classList.add('cart-bump');
        const badge = cartIcon.querySelector('.cart-badge');
        if (badge) {
          badge.classList.add('badge-pop');
        }

        setTimeout(() => {
          cartIcon.classList.remove('cart-bump');
          if (badge) {
            badge.classList.remove('badge-pop');
          }
        }, 400);
      }, 300); // Wait for the 300ms shrink-back transition to finish
    }
  };

  requestAnimationFrame(animateFrame);
};

function App() {
  const [cart, setCart] = useState(() => {
    try {
      const stored = localStorage.getItem('whiskwear_cart');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isWishlistOpen, setIsWishlistOpen] = useState(false);
  const [toast, setToast] = useState('');

  const [user, setUser] = useState(() => {
    try {
      const token = localStorage.getItem('whiskwear_user_token');
      if (isTokenExpired(token)) {
        localStorage.removeItem('whiskwear_user');
        localStorage.removeItem('whiskwear_user_token');
        return null;
      }
      return JSON.parse(localStorage.getItem('whiskwear_user'));
    } catch {
      return null;
    }
  });
  const [userToken, setUserToken] = useState(() => {
    const token = localStorage.getItem('whiskwear_user_token') || '';
    if (isTokenExpired(token)) {
      localStorage.removeItem('whiskwear_user_token');
      return '';
    }
    return token;
  });
  const [adminToken, setAdminToken] = useState(() => {
    const token = localStorage.getItem('whiskwear_admin_token') || '';
    if (isTokenExpired(token)) {
      localStorage.removeItem('whiskwear_admin_token');
      return '';
    }
    return token;
  });
  const [wishlist, setWishlist] = useState([]);

  useEffect(() => {
    try {
      localStorage.setItem('whiskwear_cart', JSON.stringify(cart));
    } catch (err) {
      console.error('Failed to save cart to localStorage:', err);
    }
  }, [cart]);

  useEffect(() => {
    if (user) {
      try {
        const stored = JSON.parse(localStorage.getItem(`whiskwear_wishlist_${user.id}`));
        setWishlist(stored || []);
      } catch {
        setWishlist([]);
      }
    } else {
      setWishlist([]);
    }
  }, [user]);

  const toggleWishlist = (product) => {
    if (!user) {
      showToast('Please sign in to add items to your wishlist.');
      return;
    }
    setWishlist(prev => {
      const exists = prev.find(item => item.id === product.id);
      let updated;
      if (exists) {
        updated = prev.filter(item => item.id !== product.id);
        showToast(`${product.name} removed from wishlist`);
      } else {
        updated = [...prev, product];
        showToast(`${product.name} added to wishlist`);
      }
      localStorage.setItem(`whiskwear_wishlist_${user.id}`, JSON.stringify(updated));
      return updated;
    });
  };

  useEffect(() => {
    if (toast) { const t = setTimeout(() => setToast(''), 4000); return () => clearTimeout(t); }
  }, [toast]);

  const showToast = useCallback((msg) => setToast(msg), []);

  const addToCart = (product, event) => {
    if (product.stock <= 0) { showToast('Item is out of stock'); return; }
    const selectedSize = product.selectedSize || (product.sizes && product.sizes.length > 0 ? product.sizes[0] : 'Standard');
    const selectedColor = product.selectedColor || (product.colors && product.colors.length > 0 ? product.colors[0] : '');
    const quantityToAdd = product.quantity || 1;

    // Check if limits exceeded before running animation or updates
    const existing = cart.find(i => i.product_id === product.id && i.selectedSize === selectedSize && i.selectedColor === selectedColor);
    const currentQty = existing ? existing.quantity : 0;
    if (currentQty + quantityToAdd > product.stock) {
      showToast(`Only ${product.stock} items available in stock`);
      return;
    }

    // Trigger the fly animation
    triggerFlyToCart(product, event);

    setCart(prev => {
      const ex = prev.find(i => i.product_id === product.id && i.selectedSize === selectedSize && i.selectedColor === selectedColor);
      if (ex) {
        const nextQty = ex.quantity + quantityToAdd;
        showToast(`Added ${quantityToAdd} more ${product.name} to cart`);
        return prev.map(i => (i.product_id === product.id && i.selectedSize === selectedSize && i.selectedColor === selectedColor) ? { ...i, quantity: nextQty } : i);
      }
      showToast(`${product.name} added to cart ✓`);
      const imgUrl = (product.image_urls && product.image_urls[0]) ? product.image_urls[0] : product.image_url;
      return [...prev, { 
        product_id: product.id, 
        name: product.name, 
        price: product.price, 
        quantity: quantityToAdd, 
        image_url: imgUrl,
        selectedSize,
        selectedColor,
        embroidery: product.embroidery || false
      }];
    });
  };

  const updateCartQty = (id, size, color, amt, limit) => {
    setCart(prev => prev.map(i => {
      if (i.product_id !== id || i.selectedSize !== size || i.selectedColor !== color) return i;
      const nq = i.quantity + amt;
      if (nq > limit) { showToast(`Only ${limit} in stock`); return i; }
      return nq > 0 ? { ...i, quantity: nq } : null;
    }).filter(Boolean));
  };
  const removeFromCart = (id, size, color) => { 
    setCart(p => p.filter(i => !(i.product_id === id && i.selectedSize === size && i.selectedColor === color))); 
    showToast('Item removed'); 
  };

  const handleUserLogout = () => {
    setUser(null); setUserToken('');
    localStorage.removeItem('whiskwear_user'); localStorage.removeItem('whiskwear_user_token');
    showToast('Logged out — see you soon!');
  };
  const handleAdminLogout = () => {
    setAdminToken(''); localStorage.removeItem('whiskwear_admin_token'); showToast('Admin session ended');
  };

  return (
    <Router>
      <AppLayout
        cart={cart} setCart={setCart}
        isCartOpen={isCartOpen} setIsCartOpen={setIsCartOpen}
        isWishlistOpen={isWishlistOpen} setIsWishlistOpen={setIsWishlistOpen}
        toast={toast} setToast={setToast} showToast={showToast}
        user={user} setUser={setUser}
        userToken={userToken} setUserToken={setUserToken}
        adminToken={adminToken} setAdminToken={setAdminToken}
        addToCart={addToCart} updateCartQty={updateCartQty} removeFromCart={removeFromCart}
        handleUserLogout={handleUserLogout} handleAdminLogout={handleAdminLogout}
        wishlist={wishlist} toggleWishlist={toggleWishlist}
      />
      <SpeedInsights />
    </Router>
  );
}

function AppLayout({
  cart, setCart, isCartOpen, setIsCartOpen, isWishlistOpen, setIsWishlistOpen, toast, setToast, showToast,
  user, setUser, userToken, setUserToken, adminToken, setAdminToken,
  addToCart, updateCartQty, removeFromCart, handleUserLogout, handleAdminLogout,
  wishlist, toggleWishlist
}) {
  const { pathname } = useLocation();
  const isAuthPage = pathname === '/login' || pathname === '/admin/login';
  const isAdminPanel = pathname.startsWith('/admin') && pathname !== '/admin/login';

  return (
    <div className="app-container">
      {!isAuthPage && !isAdminPanel && (
        <div className="sticky-header-wrapper">
          <Header
            cartCount={cart.reduce((s, i) => s + i.quantity, 0)}
            openCart={() => setIsCartOpen(true)}
            user={user} userToken={userToken} adminToken={adminToken}
            onUserLogout={handleUserLogout} onAdminLogout={handleAdminLogout}
            wishlist={wishlist}
            toggleWishlist={toggleWishlist}
            addToCart={addToCart}
            isWishlistOpen={isWishlistOpen}
            setIsWishlistOpen={setIsWishlistOpen}
          />
          <CategoryTicker />
        </div>
      )}

      <main style={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
        <Suspense fallback={
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
            <div style={{ width: 32, height: 32, border: '3px solid #e2e8f0', borderTopColor: '#2C2C2C', borderRadius: '50%', animation: 'spin 0.6s linear infinite' }} />
          </div>
        }>
        <Routes>
          <Route path="/" element={<HomePage user={user} addToCart={addToCart} openCart={() => setIsCartOpen(true)} showToast={showToast} wishlist={wishlist} toggleWishlist={toggleWishlist} />} />
          <Route path="/shop" element={<ShopPage user={user} addToCart={addToCart} openCart={() => setIsCartOpen(true)} showToast={showToast} wishlist={wishlist} toggleWishlist={toggleWishlist} />} />
          <Route path="/collections" element={<CollectionsPage wishlist={wishlist} toggleWishlist={toggleWishlist} />} />
          <Route path="/product/:id" element={<ProductDetailPage user={user} addToCart={addToCart} openCart={() => setIsCartOpen(true)} showToast={showToast} wishlist={wishlist} toggleWishlist={toggleWishlist} />} />
          
          <Route path="/login" element={userToken ? <Navigate to="/" replace /> :
            <AuthPage setUser={setUser} setUserToken={setUserToken} showToast={showToast} />} />
          <Route path="/orders" element={userToken ?
            <OrdersPage userToken={userToken} showToast={showToast} onSessionExpired={handleUserLogout} /> :
            <Navigate to="/login" replace />} />
          <Route path="/track/:orderId" element={<OrderTrackingPage userToken={userToken} showToast={showToast} />} />
          <Route path="/profile" element={userToken ?
            <UserProfilePage user={user} setUser={setUser} userToken={userToken} showToast={showToast} onUserLogout={handleUserLogout} /> :
            <Navigate to="/login" replace />} />
            
          <Route path="/admin/login" element={adminToken ? <Navigate to="/admin" replace /> :
            <AdminAuthPage setAdminToken={setAdminToken} showToast={showToast} />} />
          <Route path="/admin" element={adminToken ?
            <AdminLayout adminToken={adminToken} showToast={showToast} onSessionExpired={handleAdminLogout} /> :
            <Navigate to="/admin/login" replace />} />
            
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        </Suspense>
      </main>

      {!isAuthPage && !isAdminPanel && <SiteFooter />}

      {!isAdminPanel && (
        <CartDrawer
          isOpen={isCartOpen} closeCart={() => setIsCartOpen(false)}
          cart={cart} userToken={userToken} user={user}
          updateCartQty={updateCartQty} removeFromCart={removeFromCart}
          setCart={setCart} showToast={showToast}
        />
      )}

      <WishlistModal
        isOpen={isWishlistOpen}
        onClose={() => setIsWishlistOpen(false)}
        wishlist={wishlist}
        toggleWishlist={toggleWishlist}
        addToCart={addToCart}
      />

      {toast && (
        <div className="toast">
          <span>✦</span>
          <span>{toast}</span>
        </div>
      )}
    </div>
  );
}

export default App;
