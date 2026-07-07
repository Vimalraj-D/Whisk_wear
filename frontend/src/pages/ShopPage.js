import React, { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { apiService, getImageUrl } from '../api';
import ProductDetailModal from '../components/ProductDetailModal';
import ImageWithSkeleton from '../components/ImageWithSkeleton';

// Icons
const SearchIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8"></circle>
    <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
  </svg>
);

const CartIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.5, marginBottom: '1rem' }}>
    <circle cx="9" cy="21" r="1"></circle>
    <circle cx="20" cy="21" r="1"></circle>
    <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
  </svg>
);

const HeartIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
  </svg>
);

function useQuery() {
  return new URLSearchParams(useLocation().search);
}

export default function ShopPage({ addToCart, openCart, showToast }) {
  const query = useQuery();
  const focusParam = query.get('focus');
  const categoryParam = query.get('category') || 'all';

  const [products, setProducts] = useState([]);
  const [filter, setFilter] = useState(categoryParam);
  const [search, setSearch] = useState('');
  const [sortOption, setSortOption] = useState('recommended');
  const [detailProduct, setDetailProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [wishlist, setWishlist] = useState([]);
  const [categories, setCategories] = useState([]);
  const searchInputRef = useRef(null);

  useEffect(() => {
    if (focusParam === 'search' && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [focusParam]);

  useEffect(() => {
    setFilter(categoryParam);
  }, [categoryParam]);

  useEffect(() => {
    apiService.getCategories()
      .then(res => {
        const cats = res.data || res;
        setCategories(cats);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    setLoading(true);
    apiService.getProducts(filter === 'all' ? null : filter)
      .then(setProducts)
      .catch(e => showToast('Failed to load products'))
      .finally(() => setLoading(false));
  }, [filter, showToast]);

  const toggleWishlist = (product) => {
    if (wishlist.includes(product.id)) {
      setWishlist(wishlist.filter(id => id !== product.id));
      showToast(`${product.name} removed from wishlist`);
    } else {
      setWishlist([...wishlist, product.id]);
      showToast(`${product.name} added to wishlist`);
    }
  };

  let filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(search.toLowerCase()) || 
    p.description.toLowerCase().includes(search.toLowerCase())
  );

  if (sortOption === 'price_asc') {
    filteredProducts.sort((a, b) => parseFloat(a.price) - parseFloat(b.price));
  } else if (sortOption === 'price_desc') {
    filteredProducts.sort((a, b) => parseFloat(b.price) - parseFloat(a.price));
  }

  return (
    <div style={{ padding: '2rem', maxWidth: '1600px', margin: '0 auto' }}>
      {/* Enhanced Hero Banner */}
      <div className="page-header" style={{ marginBottom: '2rem', background: 'linear-gradient(135deg, var(--brand-navy) 0%, var(--brand-purple) 100%)', padding: '3rem 2rem', borderRadius: '16px', color: '#fff', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: '-50%', left: '-20%', width: '300px', height: '300px', background: 'radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%)', filter: 'blur(40px)' }}></div>
        <div style={{ position: 'absolute', bottom: '-50%', right: '-20%', width: '300px', height: '300px', background: 'radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%)', filter: 'blur(40px)' }}></div>
        <h2 style={{ fontSize: '2.5rem', fontWeight: 800, marginBottom: '0.5rem', fontFamily: 'var(--font-serif)', position: 'relative', zIndex: 2 }}>Shop Our Collection</h2>
        <p style={{ fontSize: '1.1rem', opacity: 0.9, maxWidth: '600px', margin: '0 auto', position: 'relative', zIndex: 2 }}>Discover our range of premium, artisanal products designed for your everyday life.</p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        {/* Filter and Search Bar */}
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', background: 'var(--glossy-bg)', padding: '1.5rem', borderRadius: '16px', border: '1px solid var(--glossy-border)' }}>
          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'center' }}>
            <select 
              className="form-control" 
              style={{ width: 'auto', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '0.5rem 1rem', fontWeight: 600 }}
              value={filter}
              onChange={e => setFilter(e.target.value)}
            >
              <option value="all">All Categories</option>
              {categories.map(c => (
                <option key={c.id} value={c.name.toLowerCase().replace(/[^a-z0-9]+/g, '_')}>{c.name}</option>
              ))}
            </select>
            <select 
              className="form-control" 
              style={{ width: 'auto', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '0.5rem 1rem' }}
              value={sortOption}
              onChange={e => setSortOption(e.target.value)}
            >
              <option value="recommended">Recommended</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
            </select>
          </div>
          <div style={{ position: 'relative', width: '100%', maxWidth: '300px' }}>
            <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', display: 'flex', alignItems: 'center', color: 'var(--text-muted)' }}>
              <SearchIcon />
            </span>
            <input 
              ref={searchInputRef}
              type="text" 
              className="form-control" 
              placeholder="Search products..." 
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{ paddingLeft: '2.5rem', margin: 0, borderRadius: '8px', border: '1px solid var(--border-color)' }}
            />
          </div>
        </div>

        {/* Product Grid */}
        {loading ? (
          <div className="product-grid">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="skeleton-card">
                <div className="skeleton-img"></div>
                <div className="skeleton-info">
                  <div className="skeleton-line title"></div>
                  <div className="skeleton-line short"></div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 'auto', paddingTop: '1rem' }}>
                    <div className="skeleton-line" style={{ width: '40%' }}></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : filteredProducts.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-secondary)' }}>
            <CartIcon />
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '0.5rem' }}>No products found</h3>
            <p>Try adjusting your search or filter.</p>
          </div>
        ) : (
          <div className="product-grid">
            {filteredProducts.map(p => {
              const originalPrice = parseFloat(p.price);
              const hasDiscount = p.discount_percent > 0;
              const discountPrice = hasDiscount ? originalPrice * (1 - p.discount_percent / 100) : originalPrice;
              const isWishlisted = wishlist.includes(p.id);
              
              return (
                <div key={p.id} className="product-card">
                  <div className="product-img-wrapper">
                    <ImageWithSkeleton src={getImageUrl(p.image_urls && p.image_urls[0] ? p.image_urls[0] : p.image_url)} alt={p.name} className="product-img" style={{ position: 'absolute', inset: 0 }} />
                    {hasDiscount ? (
                      <div className="discount-badge">{p.discount_percent}% OFF</div>
                    ) : (
                      <div className="product-category-badge badge-kitchen">New Arrival</div>
                    )}
                    <button 
                      className={`wishlist-btn ${isWishlisted ? 'active' : ''}`}
                      onClick={() => toggleWishlist(p)}
                      aria-label="Toggle wishlist"
                    >
                      <HeartIcon />
                    </button>
                    <div className="product-hover-overlay">
                      <div className="hover-actions">
                        <button className="btn btn-teal" onClick={() => addToCart({ ...p, price: discountPrice, image_url: p.image_urls && p.image_urls[0] ? p.image_urls[0] : p.image_url })}>Add to Bag</button>
                        <button className="btn-outline-white" onClick={() => setDetailProduct(p)}>Quick View</button>
                      </div>
                    </div>
                  </div>
                  <div className="product-info">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                      <h3 className="product-name" style={{ marginBottom: 0 }}>{p.name}</h3>
                      <div className="product-pricing">
                        {hasDiscount ? (
                          <>
                            <span className="discount-price">₹{discountPrice.toFixed(2)}</span>
                            <span className="original-price" style={{ fontSize: '0.85rem' }}>₹{originalPrice.toFixed(2)}</span>
                          </>
                        ) : (
                          <span className="discount-price">₹{originalPrice.toFixed(2)}</span>
                        )}
                      </div>
                    </div>
                    {/* Star Rating */}
                    <div style={{ display: 'flex', gap: '2px', marginBottom: '0.75rem', alignItems: 'center' }}>
                      {[1, 2, 3, 4, 5].map(star => (
                        <svg key={star} xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill={star <= 4 ? "#F59E0B" : "none"} stroke="#F59E0B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
                        </svg>
                      ))}
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginLeft: '4px' }}>(24)</span>
                    </div>
                    <p className="product-desc">{p.description}</p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {detailProduct && (
        <ProductDetailModal 
          product={detailProduct} 
          onClose={() => setDetailProduct(null)} 
          addToCart={addToCart} 
          openCart={openCart}
        />
      )}
    </div>
  );
}
