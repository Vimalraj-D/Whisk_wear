import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiService, getImageUrl } from '../api';
import ImageWithSkeleton from '../components/ImageWithSkeleton';
import ScrollReveal from '../components/ScrollReveal';

export default function CollectionsPage() {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      apiService.getCategories(),
      apiService.getSubcategories(),
      apiService.getProducts()
    ])
      .then(([catRes, subRes, prodRes]) => {
        setCategories(catRes.data || catRes);
        setSubcategories(subRes.data || subRes);
        setProducts(prodRes.data || prodRes);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const getCategoryKey = (name) => name.toLowerCase().replace(/[^a-z0-9]+/g, '_');

  if (loading) {
    return (
      <div style={{ padding: '2.5rem 5%', width: '100%', maxWidth: '1400px', margin: '0 auto' }}>
        <div className="product-detail-loading" style={{ minHeight: '400px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className="spinner" />
        </div>
      </div>
    );
  }

  return (
    <div className="collections-page-wrapper" style={{ padding: '3rem 5%', width: '100%', maxWidth: '1400px', margin: '0 auto' }}>
      
      {/* Editorial Luxury Header Banner */}
      <ScrollReveal direction="down" threshold={0.05}>
        <div className="collections-hero-banner" style={{
          marginBottom: '4rem',
          background: 'linear-gradient(135deg, var(--brand-navy) 0%, var(--brand-purple) 100%)',
          padding: '4rem 3rem',
          borderRadius: '24px',
          color: '#fff',
          textAlign: 'center',
          position: 'relative',
          overflow: 'hidden',
          boxShadow: 'var(--shadow-lg)'
        }}>
          <div style={{ position: 'absolute', top: '-40%', left: '-10%', width: '400px', height: '400px', background: 'radial-gradient(circle, rgba(255,255,255,0.12) 0%, transparent 70%)', filter: 'blur(50px)' }}></div>
          <div style={{ position: 'absolute', bottom: '-40%', right: '-10%', width: '400px', height: '400px', background: 'radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%)', filter: 'blur(50px)' }}></div>
          
          <span style={{ fontSize: '0.8rem', fontWeight: '900', letterSpacing: '2px', textTransform: 'uppercase', color: 'var(--brand-orange)', display: 'block', marginBottom: '0.75rem' }}>Curated Selections</span>
          <h2 style={{ fontSize: '3rem', fontWeight: 800, fontFamily: 'var(--font-serif)', marginBottom: '0.75rem', lineHeight: 1.1 }}>Our Collections</h2>
          <p style={{ fontSize: '1.15rem', opacity: 0.9, maxWidth: '600px', margin: '0 auto', lineHeight: 1.5 }}>Explore our carefully crafted apparel and essentials. Hover on any card to view collection highlights.</p>
        </div>
      </ScrollReveal>

      {categories.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '6rem 2rem', color: 'var(--text-secondary)' }}>
          <h3>No collections available</h3>
          <p>We are updating our seasonal designs. Please check back soon.</p>
        </div>
      ) : (
        <div className="collections-layout-flow" style={{ display: 'flex', flexDirection: 'column', gap: '4rem' }}>
          {categories.map((cat, idx) => {
            const catKey = getCategoryKey(cat.name);
            const catSubs = subcategories.filter(s => s.category_id === cat.id);
            const catKeyDb = cat.name.toLowerCase().replace(/[^a-z0-9]+/g, '_');
            const categoryProducts = products.filter(p => p.category === catKeyDb || p.category_id === cat.id).slice(0, 3);
            const defaultImg = 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=600&auto=format&fit=crop&q=80';
            
            return (
              <ScrollReveal key={cat.id} direction="up" threshold={0.05} delay={idx * 100}>
                <div className="collection-editorial-card">
                  
                  {/* Left showcase panel (always visible cover image & details) */}
                  <div className="collection-cover-part">
                    <div className="collection-part-bg-wrapper">
                      <img
                        src={cat.image_url || defaultImg}
                        alt={cat.name}
                        className="collection-part-bg-img"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = defaultImg;
                        }}
                      />
                    </div>
                    
                    {/* Typographic Overlay content */}
                    <div className="collection-cover-details">
                      <div className="collection-cover-header-row">
                        <span className="collection-serial-no">0{idx + 1} //</span>
                        <span className="collection-count">{categoryProducts.length}+ ITEMS</span>
                      </div>
                      
                      <h3 className="collection-cover-title">{cat.name}</h3>
                      <p className="collection-cover-desc">
                        Browse carefully engineered {cat.name.toLowerCase()} crafted from select materials for exceptional utility.
                      </p>
                      
                      {catSubs.length > 0 && (
                        <div className="collection-subcategories-list">
                          {catSubs.map(sub => (
                            <span
                              key={sub.id}
                              onClick={(e) => {
                                e.stopPropagation();
                                navigate(`/shop?category=${catKey}`);
                              }}
                              className="collection-tag-pill"
                            >
                              {sub.name}
                            </span>
                          ))}
                        </div>
                      )}

                      <button
                        className="collection-explore-btn"
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/shop?category=${catKey}`);
                        }}
                      >
                        EXPLORE COLLECTION &nbsp; ➔
                      </button>
                    </div>
                  </div>

                  {/* Right side-drawer highlights panel (reveals/slides out on desktop hover) */}
                  <div className="collection-highlights-drawer">
                    <div className="drawer-inner-content">
                      <h4 className="drawer-title">Collection Highlights</h4>
                      
                      {categoryProducts.length === 0 ? (
                        <div className="drawer-empty-msg">No products found in this category.</div>
                      ) : (
                        <div className="drawer-products-grid">
                          {categoryProducts.map(p => {
                            const op = parseFloat(p.price);
                            const disc = p.discount_percent > 0;
                            const dp = disc ? op * (1 - p.discount_percent / 100) : op;
                            return (
                              <div
                                key={p.id}
                                className="drawer-product-preview-card"
                                onClick={() => navigate(`/product/${p.id}`)}
                              >
                                <div className="drawer-product-img-wrap">
                                  <img
                                    src={getImageUrl(p.image_urls && p.image_urls[0] ? p.image_urls[0] : p.image_url)}
                                    alt={p.name}
                                    className="drawer-product-img"
                                    onError={(e) => {
                                      e.target.onerror = null;
                                      e.target.src = 'https://images.unsplash.com/photo-1590794056226-79ef3a814c2c?w=200';
                                    }}
                                  />
                                  {disc && (
                                    <span className="drawer-product-discount-tag">
                                      {p.discount_percent}% OFF
                                    </span>
                                  )}
                                </div>
                                <div className="drawer-product-info">
                                  <h5 className="drawer-product-name">{p.name}</h5>
                                  <div className="drawer-product-prices">
                                    <span className="drawer-product-active-price">₹{dp.toFixed(2)}</span>
                                    {disc && <span className="drawer-product-old-price">₹{op.toFixed(2)}</span>}
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </div>

                </div>
              </ScrollReveal>
            );
          })}
        </div>
      )}

    </div>
  );
}
