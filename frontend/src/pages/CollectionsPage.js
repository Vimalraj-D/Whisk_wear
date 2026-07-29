import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiService, getImageUrl } from '../api';
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
          <p style={{ fontSize: '1.15rem', opacity: 0.9, maxWidth: '600px', margin: '0 auto', lineHeight: 1.5 }}>Explore our carefully crafted apparel and essentials. Browse products by category.</p>
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
            const categoryProducts = products.filter(p => p.category === catKeyDb || p.category_id === cat.id);
            const defaultImg = 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=600&auto=format&fit=crop&q=80';
            
            return (
              <ScrollReveal key={cat.id} direction="up" threshold={0.05} delay={idx * 100}>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 2fr',
                  gap: '2rem',
                  alignItems: 'start'
                }}>
                  
                  {/* Left - Category Info */}
                  <div style={{
                    background: 'linear-gradient(135deg, rgba(0,0,0,0.05) 0%, rgba(0,0,0,0.02) 100%)',
                    padding: '3rem',
                    borderRadius: '16px',
                    position: 'relative',
                    overflow: 'hidden'
                  }}>
                    <div style={{ position: 'absolute', top: '-40%', right: '-40%', width: '400px', height: '400px', background: 'radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%)', filter: 'blur(50px)' }}></div>
                    <div style={{ position: 'relative', zIndex: 1 }}>
                      <span style={{ fontSize: '0.75rem', fontWeight: '900', letterSpacing: '1px', textTransform: 'uppercase', color: 'var(--brand-orange)', display: 'block', marginBottom: '0.5rem' }}>0{idx + 1} // {categoryProducts.length} Items</span>
                      <h3 style={{ fontSize: '2.2rem', fontWeight: 800, marginBottom: '1rem', color: 'var(--text-primary)' }}>{cat.name}</h3>
                      <p style={{ fontSize: '0.95rem', color: 'var(--text-secondary)', lineHeight: '1.6', marginBottom: '2rem' }}>
                        Browse carefully engineered {cat.name.toLowerCase()} crafted from select materials for exceptional utility.
                      </p>
                      <button
                        style={{
                          background: 'var(--brand-purple)',
                          color: '#fff',
                          border: 'none',
                          padding: '0.75rem 1.5rem',
                          borderRadius: '6px',
                          fontWeight: '600',
                          cursor: 'pointer',
                          fontSize: '0.9rem',
                          transition: 'all 0.3s'
                        }}
                        onClick={() => navigate(`/shop?category=${catKey}`)}
                      >
                        Explore All →
                      </button>
                    </div>
                  </div>

                  {/* Right - Scrollable Products Grid */}
                  <div style={{
                    background: 'var(--bg-light)',
                    borderRadius: '16px',
                    padding: '2rem',
                    border: '1px solid var(--border-color, #e0e0e0)',
                    maxHeight: '700px',
                    overflowY: 'auto',
                    position: 'relative'
                  }}>
                    {/* Subcategories as tags */}
                    {catSubs.length > 0 && (
                      <div style={{
                        display: 'flex',
                        gap: '0.5rem',
                        flexWrap: 'wrap',
                        marginBottom: '1.5rem',
                        paddingBottom: '1rem',
                        borderBottom: '1px solid var(--border-color, #e0e0e0)'
                      }}>
                        {catSubs.map(sub => (
                          <div
                            key={sub.id}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '0.5rem',
                              background: '#f5f5f5',
                              padding: '0.5rem 1rem',
                              borderRadius: '20px',
                              fontSize: '0.85rem',
                              cursor: 'pointer',
                              transition: 'all 0.2s',
                              border: '1px solid transparent'
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.background = 'var(--brand-teal)';
                              e.currentTarget.style.color = '#fff';
                              e.currentTarget.style.borderColor = 'var(--brand-teal)';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.background = '#f5f5f5';
                              e.currentTarget.style.color = 'inherit';
                              e.currentTarget.style.borderColor = 'transparent';
                            }}
                            onClick={() => navigate(`/shop?category=${catKey}`)}
                          >
                            {sub.image_url && (
                              <img
                                src={sub.image_url}
                                alt={sub.name}
                                style={{
                                  width: '20px',
                                  height: '20px',
                                  borderRadius: '50%',
                                  objectFit: 'cover'
                                }}
                              />
                            )}
                            {sub.name}
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Products Grid - 4 columns */}
                    {categoryProducts.length === 0 ? (
                      <div style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--text-secondary)' }}>
                        <p>No products in this category yet.</p>
                      </div>
                    ) : (
                      <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(4, 1fr)',
                        gap: '1.5rem'
                      }}>
                        {categoryProducts.map(p => {
                          const op = parseFloat(p.price);
                          const disc = p.discount_percent > 0;
                          const dp = disc ? op * (1 - p.discount_percent / 100) : op;
                          return (
                            <div
                              key={p.id}
                              style={{
                                background: '#fff',
                                borderRadius: '12px',
                                overflow: 'hidden',
                                border: '1px solid var(--border-color, #e0e0e0)',
                                cursor: 'pointer',
                                transition: 'all 0.3s',
                                display: 'flex',
                                flexDirection: 'column'
                              }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.transform = 'translateY(-4px)';
                                e.currentTarget.style.boxShadow = 'var(--shadow-md)';
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.transform = 'translateY(0)';
                                e.currentTarget.style.boxShadow = 'none';
                              }}
                              onClick={() => navigate(`/product/${p.id}`)}
                            >
                              {/* Product Image */}
                              <div style={{
                                width: '100%',
                                height: '180px',
                                background: '#f5f5f5',
                                position: 'relative',
                                overflow: 'hidden'
                              }}>
                                <img
                                  src={getImageUrl(p.image_urls && p.image_urls[0] ? p.image_urls[0] : p.image_url)}
                                  alt={p.name}
                                  style={{
                                    width: '100%',
                                    height: '100%',
                                    objectFit: 'cover',
                                    transition: 'transform 0.3s'
                                  }}
                                  onError={(e) => {
                                    e.target.onerror = null;
                                    e.target.src = 'https://images.unsplash.com/photo-1590794056226-79ef3a814c2c?w=200';
                                  }}
                                  onMouseEnter={(e) => e.target.style.transform = 'scale(1.05)'}
                                  onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
                                />
                                {disc && (
                                  <span style={{
                                    position: 'absolute',
                                    top: '8px',
                                    right: '8px',
                                    background: 'var(--color-cancelled)',
                                    color: '#fff',
                                    padding: '0.3rem 0.6rem',
                                    borderRadius: '4px',
                                    fontSize: '0.75rem',
                                    fontWeight: '700'
                                  }}>
                                    {p.discount_percent}% OFF
                                  </span>
                                )}
                              </div>

                              {/* Product Info */}
                              <div style={{ padding: '1rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
                                <h5 style={{
                                  fontSize: '0.85rem',
                                  fontWeight: '600',
                                  color: 'var(--text-primary)',
                                  marginBottom: '0.5rem',
                                  lineHeight: '1.3',
                                  overflow: 'hidden',
                                  textOverflow: 'ellipsis',
                                  display: '-webkit-box',
                                  WebkitLineClamp: '2',
                                  WebkitBoxOrient: 'vertical'
                                }}>
                                  {p.name}
                                </h5>
                                <div style={{
                                  display: 'flex',
                                  gap: '0.5rem',
                                  alignItems: 'center',
                                  marginTop: 'auto'
                                }}>
                                  <span style={{
                                    fontSize: '0.9rem',
                                    fontWeight: '700',
                                    color: 'var(--brand-teal)'
                                  }}>
                                    ₹{dp.toFixed(2)}
                                  </span>
                                  {disc && (
                                    <span style={{
                                      fontSize: '0.75rem',
                                      textDecoration: 'line-through',
                                      color: 'var(--text-muted)'
                                    }}>
                                      ₹{op.toFixed(2)}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
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
