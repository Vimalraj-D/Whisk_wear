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
                  background: '#fff',
                  borderRadius: '16px',
                  boxShadow: 'var(--shadow-lg)',
                  minHeight: 'auto'
                }}>
                  
                  {/* Left showcase panel - Category Image */}
                  <div className="collection-cover-part" style={{
                    position: 'relative',
                    overflow: 'hidden',
                    background: '#f5f5f5'
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
                          transition: 'none'
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
                      <h3 className="collection-cover-title" style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '0.5rem' }}>{cat.name}</h3>

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
                          fontSize: '0.9rem',
                          letterSpacing: '1px'
                        }}
                      >
                        Explore
                      </button>
                    </div>
                  </div>

                  {/* Right side - Shows subcategories with images */}
                  <div className="collection-highlights-drawer" style={{
                    background: '#fff',
                    display: 'flex',
                    flexDirection: 'column'
                  }}>
                    <div className="drawer-inner-content" style={{ flex: 1 }}>
                      {catSubs.length === 0 ? (
                        <div className="drawer-empty-msg" style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--text-secondary)' }}>No subcategories yet.</div>
                      ) : (
                        <div className="drawer-subcategories-grid">
                          {catSubs.map(sub => (
                            <div
                              key={sub.id}
                              className="drawer-subcategory-card"
                              onClick={() => navigate(`/shop?subcategory=${sub.name.toLowerCase().replace(/[^a-z0-9]+/g, '_')}`)}
                              style={{
                                cursor: 'pointer',
                                borderRadius: '12px',
                                overflow: 'hidden',
                                background: '#fff',
                                border: '1px solid var(--border-color, #e0e0e0)',
                                display: 'flex',
                                flexDirection: 'column'
                              }}
                            >
                              {/* Subcategory Image */}
                              <div className="drawer-subcategory-image" style={{
                                width: '100%',
                                background: '#f5f5f5',
                                position: 'relative',
                                overflow: 'hidden'
                              }}>
                                {sub.image_url ? (
                                  <img
                                    src={sub.image_url}
                                    alt={sub.name}
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
                                ) : (
                                  <div style={{
                                    width: '100%',
                                    height: '100%',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    background: 'linear-gradient(135deg, #f0f0f0 0%, #e0e0e0 100%)',
                                    color: 'var(--text-muted)',
                                    fontSize: '2rem'
                                  }}>
                                    📦
                                  </div>
                                )}
                              </div>

                              {/* Subcategory Info */}
                              <div className="drawer-subcategory-info" style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                                <h5 className="drawer-subcategory-name" style={{
                                  fontSize: '0.85rem',
                                  fontWeight: '600',
                                  color: 'var(--text-primary)',
                                  lineHeight: '1.3',
                                  textAlign: 'center'
                                }}>
                                  {sub.name}
                                </h5>
                              </div>
                            </div>
                          ))}
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
