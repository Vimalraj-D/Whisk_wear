import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiService } from '../api';
import AnimatedButton from '../components/AnimatedButton';
import ScrollReveal from '../components/ScrollReveal';

// Custom Circulating Track Component using CSS Marquee for scrolling
function SubcategoryCirculatingTrack({ subcategories, defaultImg, navigate, isMobile }) {
  const containerRef = useRef(null);
  const trackRef = useRef(null);
  
  // Duplicate items 3 times for the standard CSS marquee loop width
  const duplicatedSubs = [...subcategories, ...subcategories, ...subcategories];

  useEffect(() => {
    let active = true;

    const updateScales = () => {
      if (!active) return;

      const container = containerRef.current;
      const track = trackRef.current;
      if (!container || !track) {
        requestAnimationFrame(updateScales);
        return;
      }

      const containerRect = container.getBoundingClientRect();
      const containerCenter = containerRect.left + containerRect.width / 2;
      
      // Scaling radius is half the container width
      const maxDistance = containerRect.width / 2 || 400;

      const cards = track.children;
      for (let i = 0; i < cards.length; i++) {
        const card = cards[i];
        const cardRect = card.getBoundingClientRect();
        const cardCenter = cardRect.left + cardRect.width / 2;

        // Distance of card center from container center
        const distance = Math.abs(cardCenter - containerCenter);

        // Normalize distance between 0 (center) and 1 (edges/beyond)
        const normDist = Math.min(1, distance / maxDistance);

        // Cosine curve to make the center peak stand out nicely and drop off smoothly
        const scaleFactor = (Math.cos(normDist * Math.PI) + 1) / 2; // 1.0 (center) to 0.0 (edges)

        // Center card scales to maxScale, adjacent cards scale down, edges scale to minScale
        const minScale = isMobile ? 0.75 : 0.82;
        const maxScale = isMobile ? 1.05 : 1.18;
        const scale = minScale + (maxScale - minScale) * scaleFactor;

        // Apply scale transform and adjust opacity slightly for depth
        card.style.transform = `scale(${scale})`;
        
        // Edge cards are more transparent (0.55 opacity), center is fully opaque (1.0)
        const opacity = 0.55 + 0.45 * scaleFactor;
        card.style.opacity = opacity;
      }

      requestAnimationFrame(updateScales);
    };

    requestAnimationFrame(updateScales);

    return () => {
      active = false;
    };
  }, [isMobile]);

  return (
    <div
      ref={containerRef}
      className="subcategory-loop-container"
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        overflow: 'hidden',
        position: 'relative',
        padding: '1.5rem 0' // Space for hover scale lift
      }}
    >
      <div
        ref={trackRef}
        className="subcategory-loop-track"
        style={{
          display: 'flex',
          gap: isMobile ? '1.5rem' : '2.5rem', // Added slightly larger gap to allow space for scaled center card
          width: 'max-content',
          alignItems: 'center'
        }}
      >
        {duplicatedSubs.map((sub, idx) => (
          <div
            key={`${sub.id}-${idx}`}
            onClick={() => navigate(`/shop?subcategory=${sub.name.toLowerCase().replace(/[^a-z0-9]+/g, '_')}`)}
            className="subcategory-poster-card"
            style={{
              transformOrigin: 'center center' // Ensure cards scale from their center
            }}
          >
            <img
              src={sub.image_url || defaultImg}
              alt={sub.name}
              loading="lazy" decoding="async"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = defaultImg;
              }}
            />
            <div style={{
              position: 'absolute',
              inset: 0,
              background: 'linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.3) 50%, transparent 100%)',
              display: 'flex',
              alignItems: 'flex-end',
              padding: isMobile ? '0.5rem' : '1rem',
              zIndex: 2
            }}>
              <h5 style={{
                color: '#fff',
                fontSize: isMobile ? '0.7rem' : '0.8rem',
                fontWeight: 700,
                margin: 0,
                lineHeight: 1.2,
                textTransform: 'uppercase',
                letterSpacing: '0.5px'
              }}>
                {sub.name}
              </h5>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function CollectionsPage() {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    Promise.all([
      apiService.getCategories(),
      apiService.getSubcategories()
    ])
      .then(([catRes, subRes]) => {
        setCategories(catRes.data || catRes);
        setSubcategories(subRes.data || subRes);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const getCategoryKey = (name) => name.toLowerCase().replace(/[^a-z0-9]+/g, '_');

  if (loading) {
    return (
      <div style={{ padding: '2.5rem 5%', width: '95%', maxWidth: 'none', margin: '0 auto', minHeight: '600px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="spinner" />
      </div>
    );
  }

  const defaultCategoryImg = 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1200&auto=format&fit=crop&q=80';
  const defaultSubcategoryImg = 'https://images.unsplash.com/photo-1590794056226-79ef3a814c2c?w=400';

  return (
    <div className="collections-page-wrapper" style={{
      padding: isMobile ? '1.5rem 1rem' : '3rem 2.5%',
      width: '95%', // Covers 95% of total page width
      maxWidth: 'none',
      margin: '0 auto',
      display: 'flex',
      flexDirection: 'column',
      gap: '3rem'
    }}>

      {/* Editorial Luxury Header Banner */}
      <ScrollReveal direction="down" threshold={0.05}>
        <div className="collections-hero-banner" style={{
          background: 'linear-gradient(135deg, var(--brand-navy) 0%, var(--brand-purple) 100%)',
          padding: isMobile ? '2rem 1.5rem' : '3rem',
          borderRadius: '8px', // Reduced border radius
          color: '#fff',
          textAlign: 'center',
          position: 'relative',
          overflow: 'hidden',
          boxShadow: 'var(--shadow-lg)'
        }}>
          <div style={{ position: 'absolute', top: '-40%', left: '-10%', width: '400px', height: '400px', background: 'radial-gradient(circle, rgba(255,255,255,0.12) 0%, transparent 70%)', filter: 'blur(50px)' }}></div>
          <div style={{ position: 'absolute', bottom: '-40%', right: '-10%', width: '400px', height: '400px', background: 'radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%)', filter: 'blur(50px)' }}></div>

          <span style={{ fontSize: '0.8rem', fontWeight: '900', letterSpacing: '2px', textTransform: 'uppercase', color: 'var(--brand-orange)', display: 'block', marginBottom: '0.75rem' }}>Curated Selections</span>
          <h2 style={{ fontSize: isMobile ? '2rem' : '2.5rem', fontWeight: 800, fontFamily: 'var(--font-serif)', marginBottom: '0.75rem', lineHeight: 1.1 }}>Our Collections</h2>
          <p style={{ fontSize: isMobile ? '0.95rem' : '1.05rem', opacity: 0.9, maxWidth: '600px', margin: '0 auto', lineHeight: 1.5 }}>Explore our carefully crafted apparel and essentials. Click on any category or subcategory to begin shopping.</p>
        </div>
      </ScrollReveal>

      {categories.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '6rem 2rem', color: 'var(--text-secondary)' }}>
          <h3>No collections available</h3>
          <p>We are updating our seasonal designs. Please check back soon.</p>
        </div>
      ) : (
        <div className="collections-layout-flow" style={{ display: 'flex', flexDirection: 'column', gap: '3rem' }}>
          {categories.map((cat, idx) => {
            const catKey = getCategoryKey(cat.name);
            const catSubs = subcategories.filter(s => s.category_id === cat.id);

            return (
              <ScrollReveal key={cat.id} direction="up" threshold={0.05} delay={idx * 100}>
                {/* Horizontal Category Box Layout (Side-by-side design) */}
                <div className="collection-editorial-card" style={{
                  width: '100%',
                  height: isMobile ? 'auto' : '550px', // Static size for all boxes on desktop!
                  background: 'var(--bg-secondary)',
                  borderRadius: '8px', // Reduced border radius
                  border: '1px solid var(--border-color)',
                  boxShadow: 'var(--shadow-lg)',
                  padding: 0, // Remove internal padding to let the image touch the borders!
                  display: 'flex',
                  flexDirection: isMobile ? 'column' : 'row',
                  overflow: 'hidden'
                }}>

                  {/* Left Side: Main Category Image (Highly visible, full opacity!) */}
                  <div className="collection-main-image-banner" style={{
                    width: isMobile ? '100%' : '28%', // 28% width (narrower width)
                    height: isMobile ? '300px' : '100%', // Fills vertical space on desktop (increased height)
                    position: 'relative',
                    overflow: 'hidden',
                    flexShrink: 0
                  }}>
                    <img
                      src={cat.image_url || defaultCategoryImg}
                      alt={cat.name}
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        opacity: 1, // Completely visible!
                        transition: 'transform 0.5s ease'
                      }}
                      loading="lazy" decoding="async"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = defaultCategoryImg;
                      }}
                    />

                    {/* Dark gradient overlay for text legibility at the bottom of the image */}
                    <div style={{
                      position: 'absolute',
                      inset: 0,
                      background: 'linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.3) 60%, transparent 100%)',
                      display: 'flex',
                      alignItems: 'flex-end',
                      padding: isMobile ? '1.25rem' : '2rem',
                      zIndex: 2
                    }}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', width: '100%' }}>
                        <div>
                          <h3 style={{
                            color: '#fff',
                            fontSize: isMobile ? '1.8rem' : '2.25rem',
                            fontWeight: 900,
                            textTransform: 'uppercase',
                            margin: 0,
                            fontFamily: 'var(--font-serif)',
                            textShadow: '0 2px 4px rgba(0,0,0,0.5)'
                          }}>
                            {cat.name}
                          </h3>
                        </div>

                        <AnimatedButton
                          onClick={() => navigate(`/shop?category=${catKey}`)}
                          className="btn btn-teal ripple-button"
                          style={{
                            borderRadius: '30px',
                            padding: '0.65rem 1.75rem',
                            fontWeight: 700,
                            fontSize: '0.85rem',
                            letterSpacing: '1px',
                            width: 'fit-content',
                            boxShadow: '0 4px 12px rgba(0,0,0,0.3)'
                          }}
                        >
                          EXPLORE
                        </AnimatedButton>
                      </div>
                    </div>
                  </div>

                  {/* Right Side: Circulating Subcategories (Positioned completely next to the main category image) */}
                  <div className="collection-subcategories-banner" style={{
                    width: isMobile ? '100%' : '72%', // 72% on desktop
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    height: '100%',
                    padding: 0, // Remove all padding to eliminate empty space!
                    overflow: 'hidden'
                  }}>
                    {catSubs.length === 0 ? (
                      <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem', fontStyle: 'italic', padding: '1rem 0' }}>
                        No subcategories yet.
                      </div>
                    ) : (
                      <SubcategoryCirculatingTrack
                        subcategories={catSubs}
                        defaultImg={defaultSubcategoryImg}
                        navigate={navigate}
                        isMobile={isMobile}
                      />
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
