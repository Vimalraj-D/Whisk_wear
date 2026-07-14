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
      
      {/* Editorial Header Banner */}
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
          <h2 style={{ fontSize: '3rem', fontWeight: 800, fontFamily: 'var(--font-serif)', marginBottom: '0.75rem', lineHeight: 1.1 }}>Our Premium Collections</h2>
          <p style={{ fontSize: '1.15rem', opacity: 0.9, maxWidth: '600px', margin: '0 auto', lineHeight: 1.5 }}>Explore our carefully crafted apparel and essentials designed for comfort, style, and everyday utility.</p>
        </div>
      </ScrollReveal>

      {categories.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '6rem 2rem', color: 'var(--text-secondary)' }}>
          <h3>No collections available</h3>
          <p>We are updating our seasonal designs. Please check back soon.</p>
        </div>
      ) : (
        <div className="collections-layout-flow" style={{ display: 'flex', flexDirection: 'column', gap: '5rem' }}>
          {categories.map((cat, idx) => {
            const catKey = getCategoryKey(cat.name);
            const catSubs = subcategories.filter(s => s.category_id === cat.id);
            // Get up to 3 live product previews for this category
            // Match using category name (e.g. 'kitchen_cloths' or 'kids_wear')
            const catKeyDb = cat.name.toLowerCase().replace(/[^a-z0-9]+/g, '_');
            const categoryProducts = products.filter(p => p.category === catKeyDb || p.category_id === cat.id).slice(0, 3);
            const defaultImg = 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=600&auto=format&fit=crop&q=80';
            
            return (
              <ScrollReveal key={cat.id} direction="up" threshold={0.05} delay={idx * 100}>
                <div className="collection-editorial-section" style={{
                  display: 'grid',
                  gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1.5fr)',
                  gap: '3rem',
                  alignItems: 'stretch',
                  background: 'var(--glossy-bg)',
                  padding: '2.5rem',
                  borderRadius: '24px',
                  border: '1px solid var(--glossy-border)',
                  boxShadow: 'var(--shadow-md)',
                  position: 'relative'
                }}>
                  
                  {/* Left Column: Category Showcase Card */}
                  <div className="collection-info-panel" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: '2rem' }}>
                    <div>
                      <span style={{ fontSize: '0.75rem', fontWeight: '900', color: 'var(--brand-purple)', letterSpacing: '1px', textTransform: 'uppercase' }}>Collection 0{idx + 1}</span>
                      <h3 style={{ fontSize: '2.4rem', fontWeight: 800, margin: '8px 0 12px 0', color: 'var(--text-primary)', fontFamily: 'var(--font-serif)', lineHeight: 1.15 }}>{cat.name}</h3>
                      <p style={{ fontSize: '1.05rem', color: 'var(--text-secondary)', marginBottom: '1.5rem', lineHeight: 1.6 }}>
                        Discover our tailored range of high-quality {cat.name.toLowerCase()} crafted from organic materials and engineered for optimal utility.
                      </p>

                      {/* Subcategories tags list */}
                      {catSubs.length > 0 && (
                        <div style={{ marginBottom: '1.5rem' }}>
                          <h4 style={{ fontSize: '0.8rem', fontWeight: '800', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '10px', letterSpacing: '0.5px' }}>Subcategories</h4>
                          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                            {catSubs.map(sub => (
                              <span
                                key={sub.id}
                                onClick={() => navigate(`/shop?category=${catKey}`)}
                                style={{
                                  background: 'var(--bg-secondary)',
                                  border: '1px solid var(--border-color)',
                                  color: 'var(--text-secondary)',
                                  padding: '5px 12px',
                                  borderRadius: '50px',
                                  fontSize: '0.78rem',
                                  fontWeight: 600,
                                  cursor: 'pointer',
                                  transition: 'all 0.2s'
                                }}
                                className="collection-sub-tag"
                              >
                                {sub.name}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    <button
                      className="btn btn-primary"
                      onClick={() => navigate(`/shop?category=${catKey}`)}
                      style={{
                        alignSelf: 'flex-start',
                        padding: '0.8rem 2rem',
                        fontSize: '0.9rem',
                        fontWeight: 'bold',
                        background: 'var(--brand-navy)',
                        borderRadius: '30px'
                      }}
                    >
                      Shop Full Collection &nbsp; ➔
                    </button>
                  </div>

                  {/* Right Column: Dynamic Covers and Product Previews */}
                  <div className="collection-previews-panel" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                    {/* Editorial rectangular cover with hover zoom */}
                    <div className="collection-cover-wrapper" onClick={() => navigate(`/shop?category=${catKey}`)} style={{
                      position: 'relative',
                      height: '240px',
                      borderRadius: '16px',
                      overflow: 'hidden',
                      cursor: 'pointer',
                      boxShadow: 'var(--shadow-sm)'
                    }}>
                      <ImageWithSkeleton
                        src={cat.image_url || defaultImg}
                        alt={cat.name}
                        className="collection-cover-img"
                        style={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover',
                          transition: 'transform 0.5s cubic-bezier(0.16, 1, 0.3, 1)'
                        }}
                      />
                      <div className="collection-cover-overlay" style={{
                        position: 'absolute',
                        inset: 0,
                        background: 'linear-gradient(to top, rgba(28, 15, 67, 0.6) 0%, transparent 70%)',
                        display: 'flex',
                        alignItems: 'end',
                        padding: '1.5rem',
                        color: '#fff'
                      }}>
                        <span style={{ fontSize: '0.9rem', fontWeight: 'bold', letterSpacing: '1px', textTransform: 'uppercase' }}>Explore {cat.name} Category Cover</span>
                      </div>
                    </div>

                    {/* Live Product Previews row */}
                    {categoryProducts.length > 0 && (
                      <div>
                        <h4 style={{ fontSize: '0.85rem', fontWeight: '800', textTransform: 'uppercase', color: 'var(--text-primary)', marginBottom: '12px', letterSpacing: '0.5px' }}>Collection Highlights</h4>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.25rem' }} className="collection-highlights-grid">
                          {categoryProducts.map(p => {
                            const op = parseFloat(p.price);
                            const disc = p.discount_percent > 0;
                            const dp = disc ? op * (1 - p.discount_percent / 100) : op;
                            return (
                              <div
                                key={p.id}
                                className="collection-product-preview-card"
                                onClick={() => navigate(`/product/${p.id}`)}
                                style={{
                                  background: 'var(--bg-card)',
                                  border: '1px solid var(--border-color)',
                                  borderRadius: '12px',
                                  padding: '10px',
                                  cursor: 'pointer',
                                  display: 'flex',
                                  flexDirection: 'column',
                                  gap: '8px',
                                  transition: 'all 0.25s'
                                }}
                              >
                                <div style={{ position: 'relative', width: '100%', paddingBottom: '100%', background: 'var(--bg-secondary)', borderRadius: '8px', overflow: 'hidden' }}>
                                  <img
                                    src={getImageUrl(p.image_urls && p.image_urls[0] ? p.image_urls[0] : p.image_url)}
                                    alt={p.name}
                                    style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.3s' }}
                                    className="collection-product-img"
                                  />
                                  {disc && (
                                    <span style={{ position: 'absolute', top: '4px', left: '4px', background: 'var(--brand-purple)', color: '#fff', fontSize: '0.65rem', fontWeight: 'bold', padding: '2px 6px', borderRadius: '4px' }}>
                                      {p.discount_percent}% OFF
                                    </span>
                                  )}
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', flexGrow: 1, minHeight: '60px', justifyContent: 'space-between' }}>
                                  <h5 style={{ fontSize: '0.85rem', fontWeight: 'bold', color: 'var(--text-primary)', margin: 0, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', lineHeight: 1.25 }}>
                                    {p.name}
                                  </h5>
                                  <div style={{ display: 'flex', gap: '6px', alignItems: 'baseline' }}>
                                    <span style={{ fontSize: '0.85rem', fontWeight: 'bold', color: 'var(--text-primary)' }}>₹{dp.toFixed(2)}</span>
                                    {disc && <span style={{ fontSize: '0.72rem', textDecoration: 'line-through', color: 'var(--text-muted)' }}>₹{op.toFixed(2)}</span>}
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
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
