import React, { useState, useEffect, useCallback } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';

// Components
import Header from './components/Header';
import SiteFooter from './components/SiteFooter';
import CartDrawer from './components/CartDrawer';

// Pages
import HomePage from './pages/HomePage';
import ShopPage from './pages/ShopPage';
import CollectionsPage from './pages/CollectionsPage';
import AuthPage from './pages/AuthPage';
import OrdersPage from './pages/OrdersPage';
import UserProfilePage from './pages/UserProfilePage';

// Admin Pages
import AdminAuthPage from './pages/admin/AdminAuthPage';
import AdminLayout from './pages/admin/AdminLayout';

function App() {
  const [cart, setCart] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [toast, setToast] = useState('');

  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem('whiskwear_user')); } catch { return null; }
  });
  const [userToken, setUserToken] = useState(() => localStorage.getItem('whiskwear_user_token') || '');
  const [adminToken, setAdminToken] = useState(() => localStorage.getItem('whiskwear_admin_token') || '');

  useEffect(() => {
    if (toast) { const t = setTimeout(() => setToast(''), 4000); return () => clearTimeout(t); }
  }, [toast]);

  const showToast = useCallback((msg) => setToast(msg), []);

  const addToCart = (product) => {
    if (product.stock <= 0) { showToast('Item is out of stock'); return; }
    const selectedSize = product.selectedSize || (product.sizes && product.sizes.length > 0 ? product.sizes[0] : 'Standard');
    const selectedColor = product.selectedColor || (product.colors && product.colors.length > 0 ? product.colors[0] : '');
    const quantityToAdd = product.quantity || 1;

    setCart(prev => {
      const ex = prev.find(i => i.product_id === product.id && i.selectedSize === selectedSize && i.selectedColor === selectedColor);
      if (ex) {
        const nextQty = ex.quantity + quantityToAdd;
        if (nextQty > product.stock) {
          showToast(`Only ${product.stock} items available in stock`);
          return prev.map(i => (i.product_id === product.id && i.selectedSize === selectedSize && i.selectedColor === selectedColor) ? { ...i, quantity: product.stock } : i);
        }
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
        toast={toast} setToast={setToast} showToast={showToast}
        user={user} setUser={setUser}
        userToken={userToken} setUserToken={setUserToken}
        adminToken={adminToken} setAdminToken={setAdminToken}
        addToCart={addToCart} updateCartQty={updateCartQty} removeFromCart={removeFromCart}
        handleUserLogout={handleUserLogout} handleAdminLogout={handleAdminLogout}
      />
    </Router>
  );
}

function AppLayout({
  cart, setCart, isCartOpen, setIsCartOpen, toast, setToast, showToast,
  user, setUser, userToken, setUserToken, adminToken, setAdminToken,
  addToCart, updateCartQty, removeFromCart, handleUserLogout, handleAdminLogout
}) {
  const { pathname } = useLocation();
  const isAuthPage = pathname === '/login' || pathname === '/admin/login';
  const isAdminPanel = pathname.startsWith('/admin') && pathname !== '/admin/login';

  return (
    <div className="app-container">
      {!isAuthPage && !isAdminPanel && (
        <Header
          cartCount={cart.reduce((s, i) => s + i.quantity, 0)}
          openCart={() => setIsCartOpen(true)}
          user={user} userToken={userToken} adminToken={adminToken}
          onUserLogout={handleUserLogout} onAdminLogout={handleAdminLogout}
        />
      )}

      <main style={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
        <Routes>
          <Route path="/" element={<HomePage user={user} addToCart={addToCart} openCart={() => setIsCartOpen(true)} showToast={showToast} />} />
          <Route path="/shop" element={<ShopPage user={user} addToCart={addToCart} openCart={() => setIsCartOpen(true)} showToast={showToast} />} />
          <Route path="/collections" element={<CollectionsPage />} />
          
          <Route path="/login" element={userToken ? <Navigate to="/" replace /> :
            <AuthPage setUser={setUser} setUserToken={setUserToken} showToast={showToast} />} />
          <Route path="/orders" element={userToken ?
            <OrdersPage userToken={userToken} showToast={showToast} onSessionExpired={handleUserLogout} /> :
            <Navigate to="/login" replace />} />
          <Route path="/profile" element={userToken ?
            <UserProfilePage user={user} setUser={setUser} showToast={showToast} onUserLogout={handleUserLogout} /> :
            <Navigate to="/login" replace />} />
            
          <Route path="/admin/login" element={adminToken ? <Navigate to="/admin" replace /> :
            <AdminAuthPage setAdminToken={setAdminToken} showToast={showToast} />} />
          <Route path="/admin" element={adminToken ?
            <AdminLayout adminToken={adminToken} showToast={showToast} onSessionExpired={handleAdminLogout} /> :
            <Navigate to="/admin/login" replace />} />
            
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
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
