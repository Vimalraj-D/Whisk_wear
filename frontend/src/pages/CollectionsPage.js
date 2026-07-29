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
                <div className="collection-editorial-card" style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: '0',
                  background: '#fff',
                  borderRadius: '16px',
                  overflow: 'hidden',
                  boxShadow: 'var(--shadow-lg)',
                  transition: 'all 0.4s',
                  minHeight: '500px',
                  position: 'relative'
                }}>
                  
                  {/* Left showcase panel - Category Image (expands on hover) */}
                  <div className="collection-cover-part" style={{
                    position: 'relative',
                    overflow: 'hidden',
                    background: '#f5f5f5',
                    transition: 'all 0.4s',
                    gridColumn: '1',
                    gridRow: '1'
                  }}>
                    <div className="collection-part-bg-wrapper" style={{
                      width: '100%',
                      height: '100%',
                      overflow: 'hidden'
                    }}>
                      <img
                        src={cat.image_url || defaultImg}
                        alt={cat.name}
                        className="collection-part-bg-img"
                        style={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover',
                          transition: 'transform 0.4s'
                        }}
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = defaultImg;
                        }}
                      />
                    </div>
                    
                    {/* Typographic Overlay content */}
                    <div className="collection-cover-details" style={{
                      position: 'absolute',
                      bottom: 0,
                      left: 0,
                      right: 0,
                      background: 'linear-gradient(to top, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.4) 50%, transparent 100%)',
                      color: '#fff',
                      padding: '3rem 2rem 2rem',
                      zIndex: 2
                    }}>
                      <div className="collection-cover-header-row" style={{ display: 'flex', gap: '1rem', marginBottom: '1rem', fontSize: '0.75rem', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '1px' }}>
                        <span className="collection-serial-no">0{idx + 1} //</span>
                        <span className="collection-count">{categoryProducts.length}+ ITEMS</span>
                      </div>
                      
                      <h3 className="collection-cover-title" style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '0.5rem' }}>{cat.name}</h3>
                      <p className="collection-cover-desc" style={{ fontSize: '0.9rem', opacity: 0.9, lineHeight: 1.4 }}>
                        Browse carefully engineered {cat.name.toLowerCase()} crafted from select materials for exceptional utility.
                      </p>
                      
                      {catSubs.length > 0 && (
                        <div className="collection-subcategories-list" style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginTop: '1rem' }}>
                          {catSubs.map(sub => (
                            <span
                              key={sub.id}
                              onClick={(e) => {
                                e.stopPropagation();
                                navigate(`/shop?category=${catKey}`);
                              }}
                              className="collection-tag-pill"
                              style={{
                                background: 'rgba(255,255,255,0.2)',
                                backdropFilter: 'blur(10px)',
                                padding: '0.4rem 0.8rem',
                                borderRadius: '20px',
                                fontSize: '0.75rem',
                                cursor: 'pointer',
                                border: '1px solid rgba(255,255,255,0.3)',
                                transition: 'all 0.2s',
                                whiteSpace: 'nowrap'
                              }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.background = 'rgba(255,255,255,0.3)';
                                e.currentTarget.style.transform = 'scale(1.05)';
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.background = 'rgba(255,255,255,0.2)';
                                e.currentTarget.style.transform = 'scale(1)';
                              }}
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
                        style={{
                          marginTop: '1.5rem',
                          background: 'var(--brand-orange)',
                          color: '#fff',
                          border: 'none',
                          padding: '0.75rem 1.5rem',
                          borderRadius: '6px',
                          fontWeight: '600',
                          cursor: 'pointer',
                          fontSize: '0.85rem',
                          transition: 'all 0.2s',
                          textTransform: 'uppercase',
                          letterSpacing: '1px'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = '#ff6b35';
                          e.currentTarget.style.transform = 'translateX(4px)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = 'var(--brand-orange)';
                          e.currentTarget.style.transform = 'translateX(0)';
                        }}
                      >
                        EXPLORE COLLECTION &nbsp; ➔
                      </button>
                    </div>
                  </div>

                  {/* Right side-drawer highlights panel - Shows products */}
                  <div className="collection-highlights-drawer" style={{
                    background: '#fff',
                    padding: '2.5rem',
                    gridColumn: '2',
                    gridRow: '1',
                    display: 'flex',
                    flexDirection: 'column',
                    transition: 'all 0.4s',
                    borderLeft: '1px solid var(--border-color, #e0e0e0)'
                  }}>
                    <div className="drawer-inner-content" style={{ flex: 1 }}>
                      <h4 className="drawer-title" style={{ fontSize: '1.1rem', fontWeight: '700', marginBottom: '1.5rem', color: 'var(--text-primary)' }}>Collection Highlights</h4>
                      
                      {categoryProducts.length === 0 ? (
                        <div className="drawer-empty-msg" style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--text-secondary)' }}>No products found in this category.</div>
                      ) : (
                        <div className="drawer-products-grid" style={{
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '1.5rem'
                        }}>
                          {categoryProducts.map(p => {
                            const op = parseFloat(p.price);
                            const disc = p.discount_percent > 0;
                            const dp = disc ? op * (1 - p.discount_percent / 100) : op;
                            return (
                              <div
                                key={p.id}
                                className="drawer-product-preview-card"
                                onClick={() => navigate(`/product/${p.id}`)}
                                style={{
                                  display: 'flex',
                                  gap: '1rem',
                                  padding: '1rem',
                                  background: '#f9f9f9',
                                  borderRadius: '12px',
                                  cursor: 'pointer',
                                  transition: 'all 0.3s',
                                  border: '1px solid var(--border-color, #e0e0e0)'
                                }}
                                onMouseEnter={(e) => {
                                  e.currentTarget.style.background = '#f0f0f0';
                                  e.currentTarget.style.transform = 'translateX(8px)';
                                }}
                                onMouseLeave={(e) => {
                                  e.currentTarget.style.background = '#f9f9f9';
                                  e.currentTarget.style.transform = 'translateX(0)';
                                }}
                              >
                                <div className="drawer-product-img-wrap" style={{
                                  width: '100px',
                                  height: '100px',
                                  borderRadius: '8px',
                                  overflow: 'hidden',
                                  flexShrink: 0,
                                  position: 'relative',
                                  background: '#e0e0e0'
                                }}>
                                  <img
                                    src={getImageUrl(p.image_urls && p.image_urls[0] ? p.image_urls[0] : p.image_url)}
                                    alt={p.name}
                                    className="drawer-product-img"
                                    style={{
                                      width: '100%',
                                      height: '100%',
                                      objectFit: 'cover'
                                    }}
                                    onError={(e) => {
                                      e.target.onerror = null;
                                      e.target.src = 'https://images.unsplash.com/photo-1590794056226-79ef3a814c2c?w=200';
                                    }}
                                  />
                                  {disc && (
                                    <span className="drawer-product-discount-tag" style={{
                                      position: 'absolute',
                                      top: '6px',
                                      right: '6px',
                                      background: 'var(--color-cancelled)',
                                      color: '#fff',
                                      padding: '0.3rem 0.6rem',
                                      borderRadius: '4px',
                                      fontSize: '0.7rem',
                                      fontWeight: '700'
                                    }}>
                                      {p.discount_percent}% OFF
                                    </span>
                                  )}
                                </div>
                                <div className="drawer-product-info" style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                                  <h5 className="drawer-product-name" style={{
                                    fontSize: '0.9rem',
                                    fontWeight: '600',
                                    marginBottom: '0.5rem',
                                    color: 'var(--text-primary)',
                                    lineHeight: 1.3
                                  }}>{p.name}</h5>
                                  <div className="drawer-product-prices" style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginTop: 'auto' }}>
                                    <span className="drawer-product-active-price" style={{ fontSize: '0.95rem', fontWeight: '700', color: 'var(--brand-teal)' }}>₹{dp.toFixed(2)}</span>
                                    {disc && <span className="drawer-product-old-price" style={{ fontSize: '0.8rem', textDecoration: 'line-through', color: 'var(--text-muted)' }}>₹{op.toFixed(2)}</span>}
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
