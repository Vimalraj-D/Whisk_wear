import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiService } from '../api';
import AnimatedButton from '../components/AnimatedButton';
import ScrollReveal from '../components/ScrollReveal';

// Custom Circulating Track Component using CSS Marquee for scrolling + JS for dynamic 3D center projection
function SubcategoryCirculatingTrack({ subcategories, defaultImg, navigate, isMobile }) {
  const containerRef = useRef(null);

  // Duplicate items 3 times for the standard CSS marquee loop width
  const duplicatedSubs = [...subcategories, ...subcategories, ...subcategories];

  useEffect(() => {
    const container = containerRef.current;
    if (!container || subcategories.length === 0) return;

    let animationFrameId;

    const updateProjection = () => {
      const containerRect = container.getBoundingClientRect();
      const containerCenter = containerRect.left + containerRect.width / 2;

      // Query cards inside the track
      const cards = container.querySelectorAll('.subcategory-poster-card');
      cards.forEach(card => {
        const cardRect = card.getBoundingClientRect();
        const cardCenter = cardRect.left + cardRect.width / 2;
        const diff = cardCenter - containerCenter;
        const distanceFromCenter = Math.abs(diff);

        // Max distance is half container width
        const maxDistance = containerRect.width / 2 || 1;
        const ratio = diff / maxDistance;
        const absRatio = Math.min(1, distanceFromCenter / maxDistance);

        // Cosine ease squared for a steeper, more pronounced 3D drop-off (Center is full size, adjacent is small, outer is smaller)
        const ease = Math.pow(Math.cos(absRatio * Math.PI / 2), 2);

        // Compute 3D cylinder perspective factors
        const scale = 0.65 + ease * 0.53; // Center: 1.18 | Adjacent: 0.85 | Outer: 0.65
        const yRotation = -ratio * 32;   // Rotate around Y axis by up to 32 degrees
        const opacity = 0.40 + ease * 0.60; // Fade at edges
        const brightness = 0.50 + ease * 0.50; // Darken at edges
        const zIndex = Math.round(ease * 100);

        // Set true GPU-accelerated 3D Transform!
        card.style.transform = `scale(${scale}) rotateY(${yRotation}deg)`;
        card.style.opacity = `${opacity}`;
        card.style.filter = `brightness(${brightness})`;
        card.style.zIndex = zIndex;

        // Solid, realistic dark shadow
        const shadowIntensity = ease * 12;
        card.style.boxShadow = `0 ${6 + shadowIntensity}px ${12 + shadowIntensity * 2}px rgba(0, 0, 0, 0.45)`;
      });

      animationFrameId = requestAnimationFrame(updateProjection);
    };

    animationFrameId = requestAnimationFrame(updateProjection);

    return () => cancelAnimationFrame(animationFrameId);
  }, [subcategories]);

  return (
    <div
      ref={containerRef}
      className="subcategory-loop-container"
      style={{
        width: '100%',
        height: '100%', // Fills parent height
        display: 'flex',
        alignItems: 'center', // Centers vertically so scaled cards don't clip at top/bottom
        overflow: 'hidden',
        position: 'relative',
        perspective: '1000px', // Creates the 3D depth environment
        perspectiveOrigin: '50% 50%'
      }}
    >
      <div
        className="subcategory-loop-track"
        style={{
          display: 'flex',
          gap: isMobile ? '1.5rem' : '2.5rem',
          width: 'max-content',
          alignItems: 'center',
          transformStyle: 'preserve-3d' // Passes 3D context to child cards
        }}
      >
        {duplicatedSubs.map((sub, idx) => (
          <div
            key={`${sub.id}-${idx}`}
            onClick={() => navigate(`/shop?subcategory=${sub.name.toLowerCase().replace(/[^a-z0-9]+/g, '_')}`)}
            className="subcategory-poster-card"
          >
            <img
              src={sub.image_url || defaultImg}
              alt={sub.name}
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
              padding: '1rem',
              zIndex: 2
            }}>
              <h5 style={{
                color: '#fff',
                fontSize: '0.8rem',
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
