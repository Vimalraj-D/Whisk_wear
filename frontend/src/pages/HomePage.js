import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiService, getImageUrl } from '../api';
import ImageWithSkeleton from '../components/ImageWithSkeleton';
import ScrollReveal from '../components/ScrollReveal';
import Parallax3DFashion from '../components/Parallax3DFashion';

const VIDEO_URLS = [
  'https://aoppjuuqdgajcidduqld.supabase.co/storage/v1/object/public/Images/video/i_not_need_whisk_wear_text_in.mp4', // #video url 1
  'https://aoppjuuqdgajcidduqld.supabase.co/storage/v1/object/public/Images/video/like_this_for_chef_appearl_for.mp4',     // #video url 2
  'https://aoppjuuqdgajcidduqld.supabase.co/storage/v1/object/public/Images/video/it_is_for_both_hotel_and_home.mp4'      // #video url 3
];

const HeartIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" style={{ width: '16px', height: '16px', display: 'block' }}>
    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" fill="currentColor"></path>
  </svg>
);

export default function HomePage({ user, addToCart, openCart, showToast, wishlist = [], toggleWishlist }) {
  const navigate = useNavigate();
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [bestSellers, setBestSellers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState([]);
  const [isMuted, setIsMuted] = useState(true);
  
  // Carousel state
  const [currentSlide, setCurrentSlide] = useState(0);
  const slides = [
    {
      badge: "✦ Premium Quality · Ethically Made",
      title: "New Summer\nCollection.",
      subtitle: "Thoughtfully designed kitchen cloths and organic kids' wear crafted for everyday comfort and beauty.",
      img: "https://aoppjuuqdgajcidduqld.supabase.co/storage/v1/object/public/Images/ChatGPT%20Image%20Jul%207,%202026,%2001_13_12%20AM.png",
      cta: "SHOP NOW"
    },
    {
      badge: "✦ 20% OFF ALL KIDS WEAR",
      title: "Playful Comfort\nFor Kids.",
      subtitle: "Discover our new range of breathable, organic cotton outfits perfect for the summer heat.",
      img: "https://aoppjuuqdgajcidduqld.supabase.co/storage/v1/object/public/Images/ChatGPT%20Image%20Jul%207,%202026,%2001_15_10%20AM.png",
      cta: "EXPLORE KIDS"
    },
    {
      badge: "✦ BUY 2 GET 1 FREE",
      title: "Premium Kitchen\nEssentials.",
      subtitle: "Upgrade your kitchen with our highly absorbent, durable, and stylish cloths.",
      img: "https://aoppjuuqdgajcidduqld.supabase.co/storage/v1/object/public/Images/ChatGPT%20Image%20Jul%207,%202026,%2001_19_21%20AM.png",
      cta: "SHOP KITCHEN"
    },
    {
      badge: "✦ PROFESSIONAL CHEF WEAR",
      title: "Premium Chef\nApparel.",
      subtitle: "Cook with confidence in comfortable, durable, and professional chef uniforms designed for every kitchen.",
      img: "https://aoppjuuqdgajcidduqld.supabase.co/storage/v1/object/public/Images/ChatGPT%20Image%20Jul%207,%202026,%2001_24_35%20AM.png",
      cta: "SHOP CHEF WEAR"
    }
  ];

  useEffect(() => {
    // Auto-advance carousel
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [slides.length]);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      apiService.getProducts(),
      apiService.getCategories()
    ])
      .then(([prodRes, catRes]) => {
        const data = prodRes.data || prodRes;
        const featured = data.filter(p => p.is_featured === true || p.is_featured === 'true');
        setFeaturedProducts(featured.slice(0, 8));
        const sortedBySales = [...data].sort((a, b) => (b.sales_count || 0) - (a.sales_count || 0));
        setBestSellers(sortedBySales.slice(0, 6));

        const cats = catRes.data || catRes;
        const defaultImg = 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400&auto=format&fit=crop&q=80';
        const dynamicCats = [
          { key: 'all', label: 'All Collection', img: 'https://aoppjuuqdgajcidduqld.supabase.co/storage/v1/object/public/Images/ChatGPT%20Image%20Jul%207,%202026,%2012_39_37%20AM.png' },
          ...cats.map(c => ({
            key: c.name.toLowerCase().replace(/[^a-z0-9]+/g, '_'),
            label: c.name,
            img: c.image_url || defaultImg
          }))
        ];
        setCategories(dynamicCats);
      })
      .catch(e => showToast('Failed to load products'))
      .finally(() => setLoading(false));
  }, [showToast]);

  const [currentVideoIdx, setCurrentVideoIdx] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const videoRefs = useRef([]);

  const handleVideoEnded = () => {
    setCurrentVideoIdx((prev) => (prev + 1) % VIDEO_URLS.length);
  };
  const prevVideo = () => {
    setCurrentVideoIdx((prev) => (prev === 0 ? VIDEO_URLS.length - 1 : prev - 1));
  };
  const nextVideo = () => {
    setCurrentVideoIdx((prev) => (prev + 1) % VIDEO_URLS.length);
  };

  useEffect(() => {
    VIDEO_URLS.forEach((_, idx) => {
      const videoEl = videoRefs.current[idx];
      if (!videoEl) return;

      if (idx === currentVideoIdx) {
        // Active video: mute according to state, reset play time, and play
        videoEl.muted = isMuted;
        videoEl.currentTime = 0;
        
        videoEl.play().catch(e => console.error("Video play failed:", e));
      } else {
        // Inactive videos: pause and mute to avoid double audio playing
        videoEl.pause();
        videoEl.muted = true;
      }
    });
  }, [currentVideoIdx, isMuted]);

  useEffect(() => {
    // If active video is currently playing, let it play to the end and trigger handleVideoEnded
    if (isPlaying) return;

    // Otherwise (autoplay blocked, manually paused, etc.), slide automatically after 6 seconds
    const timer = setTimeout(() => {
      nextVideo();
    }, 6000);

    return () => clearTimeout(timer);
  }, [isPlaying, currentVideoIdx]);

  const slide = slides[currentSlide];

  return (
    <div>
      {/* Hero Carousel */}
      <section className="hero-grid" style={{ position: 'relative', overflow: 'hidden' }}>
        <div className="hero-left" style={{ animation: 'fadeUp 0.5s ease-out' }} key={`text-${currentSlide}`}>
          <div className="hero-badge">{slide.badge}</div>
          <h1 className="hero-title" style={{ whiteSpace: 'pre-line' }}>{slide.title}</h1>
          <p className="hero-subtitle">{slide.subtitle}</p>
          <div className="hero-cta-row">
            <button className="btn btn-primary btn-lg" onClick={() => navigate('/shop')}>
              {slide.cta} &nbsp; ➔
            </button>
          </div>
        </div>
        <div className="hero-right" style={{ animation: 'fadeUp 0.5s ease-out 0.2s backwards' }} key={`img-${currentSlide}`}>
          <div className="hero-bg-shape" />
          <ImageWithSkeleton src={slide.img} alt="Featured" className="hero-product-img" style={{ zIndex: 2, borderRadius: slide.img.includes('unsplash') ? '50%' : '0', width: '100%', maxWidth: '700px', height: 'clamp(360px, 60vw, 600px)', margin: '0 auto', display: 'flex', justifyContent: 'center', alignItems: 'center' }} />
        </div>
        
        {/* Carousel Indicators */}
        <div style={{ position: 'absolute', bottom: '20px', left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: '10px', zIndex: 10 }}>
          {slides.map((_, idx) => (
            <button 
              key={idx}
              onClick={() => setCurrentSlide(idx)}
              style={{ 
                width: '10px', height: '10px', borderRadius: '50%', border: 'none', cursor: 'pointer',
                background: currentSlide === idx ? 'var(--brand-teal)' : '#ccc',
                transition: 'background 0.3s'
              }}
            />
          ))}
        </div>
      </section>

      {/* Shop By Categories */}
      <ScrollReveal direction="up" threshold={0.05}>
        <section id="shop-collections" style={{ padding: '3rem 2rem' }}>
          <div className="section-title-row">
            <h2 className="section-title">Shop by categories</h2>
            <button className="arrow-circle-btn" onClick={() => navigate('/collections')}>➔</button>
          </div>

          <div className="categories-container">
            {categories.map((c, idx) => (
              <div
                key={idx}
                className="category-circle-wrapper"
                onClick={() => {
                  navigate(`/shop?category=${c.key}`);
                }}
              >
                <div className={`category-circle-card`}>
                  <ImageWithSkeleton src={c.img} alt={c.label} className="category-circle-img" />
                  <div className="category-circle-overlay">
                    <span className="category-circle-name">{c.label}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </ScrollReveal>

      {/* 3D Parallax Fashion Showcase */}
      <Parallax3DFashion />

      {/* Featured Products Section */}
      <section className="new-arrivals-section">
        <ScrollReveal direction="up">
          <div className="section-title-row">
            <h2 className="section-title">Featured Products</h2>
            <button className="btn btn-outline-teal" style={{ padding: '0.5rem 1rem' }} onClick={() => navigate('/shop')}>
              View All
            </button>
          </div>
        </ScrollReveal>

        {loading ? (
          <div className="loading-screen"><div className="spinner" /></div>
        ) : (
          <div className="product-grid">
            {featuredProducts.map((p, idx) => {
              const originalPrice = parseFloat(p.price);
              const hasDiscount = p.discount_percent > 0;
              const discountPrice = hasDiscount ? originalPrice * (1 - p.discount_percent / 100) : originalPrice;
              const isWishlisted = wishlist.some(item => item.id === p.id);
              return (
                <ScrollReveal key={p.id} delay={(idx % 4) * 100} threshold={0.05}>
                  <div className="product-card">
                    <div className="product-img-wrapper">
                      <ImageWithSkeleton src={getImageUrl(p.image_urls && p.image_urls[0] ? p.image_urls[0] : p.image_url)} alt={p.name} className="product-img" style={{ position: 'absolute', inset: 0 }} />
                      {hasDiscount ? (
                        <div className="discount-badge">{p.discount_percent}% OFF</div>
                      ) : (
                        <div className="product-category-badge badge-kitchen">New Arrival</div>
                      )}
                      {user && (
                        <button 
                          className={`wishlist-btn ${isWishlisted ? 'active' : ''}`}
                          onClick={() => toggleWishlist(p)}
                          aria-label="Toggle wishlist"
                          style={{
                            position: 'absolute',
                            top: '12px',
                            right: '12px',
                            zIndex: 10,
                            background: 'rgba(255, 255, 255, 0.9)',
                            border: 'none',
                            borderRadius: '50%',
                            width: '32px',
                            height: '32px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer',
                            color: isWishlisted ? 'var(--color-cancelled)' : 'var(--text-secondary)',
                            boxShadow: 'var(--shadow-sm)',
                            transition: 'color 0.2s, background-color 0.2s'
                          }}
                        >
                          <HeartIcon />
                        </button>
                      )}
                      <div className="product-hover-overlay">
                        <div className="hover-actions">
                          <button className="btn btn-teal" onClick={() => addToCart({ ...p, price: discountPrice, image_url: p.image_urls && p.image_urls[0] ? p.image_urls[0] : p.image_url })}>Add to Bag</button>
                          <button className="btn-outline-white" onClick={() => navigate(`/product/${p.id}`)}>Quick View</button>
                        </div>
                      </div>
                    </div>
                    <div className="product-info">
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <h3 className="product-name">{p.name}</h3>
                        <div className="product-pricing">
                          {hasDiscount ? (
                            <>
                              <span className="discount-price">₹{discountPrice.toFixed(2)}</span>
                              <span className="original-price">₹{originalPrice.toFixed(2)}</span>
                            </>
                          ) : (
                            <span className="discount-price">₹{originalPrice.toFixed(2)}</span>
                          )}
                        </div>
                      </div>
                      <p className="product-desc">{p.description}</p>
                    </div>
                  </div>
                </ScrollReveal>
              );
            })}
            {featuredProducts.length === 0 && (
              <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '2rem', color: 'var(--text-secondary)' }}>
                No featured products yet.
              </div>
            )}
          </div>
        )}
      </section>

      {/* Watch Our Collections Video Slider Section */}
      <ScrollReveal direction="up" threshold={0.05}>
        <section className="new-arrivals-section" style={{ marginTop: '4rem', padding: '3.5rem 2.5rem', borderRadius: '16px' }}>
          <div className="section-title-row" style={{ marginBottom: '2.25rem' }}>
            <h2 className="section-title">Watch Our Collections</h2>
          </div>

          <div style={{ position: 'relative', overflow: 'hidden', width: '100%', aspectRatio: '16/9', maxHeight: '600px', borderRadius: '16px', background: '#000', boxShadow: 'var(--shadow-lg)' }}>
            {/* Sliding Track */}
            <div style={{
              display: 'flex',
              transform: `translateX(-${currentVideoIdx * 100}%)`,
              transition: 'transform 0.8s cubic-bezier(0.16, 1, 0.3, 1)',
              width: '100%',
              height: '100%'
            }}>
              {VIDEO_URLS.map((url, idx) => (
                <div key={idx} style={{ minWidth: '100%', height: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                  <video
                    ref={el => videoRefs.current[idx] = el}
                    src={url}
                    controls
                    playsInline
                    onPlay={() => setIsPlaying(true)}
                    onPause={() => setIsPlaying(false)}
                    onEnded={handleVideoEnded}
                    style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                  />
                </div>
              ))}
            </div>

            {/* Mute/Unmute floating button overlay */}
            <button
              onClick={() => setIsMuted(prev => !prev)}
              style={{
                position: 'absolute',
                top: '20px',
                right: '20px',
                background: 'rgba(255, 255, 255, 0.85)',
                border: 'none',
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                cursor: 'pointer',
                zIndex: 15,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 10px rgba(0,0,0,0.15)',
                color: 'var(--text-primary)',
                transition: 'transform 0.2s, background-color 0.2s'
              }}
              title={isMuted ? "Unmute sound" : "Mute sound"}
            >
              {isMuted ? (
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
                  <line x1="23" y1="9" x2="17" y2="15"></line>
                  <line x1="17" y1="9" x2="23" y2="15"></line>
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
                  <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"></path>
                </svg>
              )}
            </button>

            {/* Navigation Arrows */}
            <button 
              onClick={prevVideo} 
              style={{
                position: 'absolute', top: '50%', left: '20px', transform: 'translateY(-50%)',
                background: 'rgba(255, 255, 255, 0.7)', border: 'none', width: '44px', height: '44px',
                borderRadius: '50%', cursor: 'pointer', zIndex: 10, display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '1.2rem', fontWeight: 'bold', transition: 'background 0.3s'
              }}
            >
              ←
            </button>
            <button 
              onClick={nextVideo} 
              style={{
                position: 'absolute', top: '50%', right: '20px', transform: 'translateY(-50%)',
                background: 'rgba(255, 255, 255, 0.7)', border: 'none', width: '44px', height: '44px',
                borderRadius: '50%', cursor: 'pointer', zIndex: 10, display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '1.2rem', fontWeight: 'bold', transition: 'background 0.3s'
              }}
            >
              →
            </button>

            {/* Indicator dots */}
            <div style={{ position: 'absolute', bottom: '20px', left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: '8px', zIndex: 10 }}>
              {VIDEO_URLS.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentVideoIdx(idx)}
                  style={{
                    width: '8px', height: '8px', borderRadius: '50%', border: 'none', cursor: 'pointer',
                    background: currentVideoIdx === idx ? 'var(--brand-purple)' : 'rgba(255, 255, 255, 0.5)',
                    transition: 'background 0.3s'
                  }}
                />
              ))}
            </div>
          </div>
        </section>
      </ScrollReveal>

      {/* Highly Purchased Products Section */}
      <section className="new-arrivals-section" style={{ marginTop: '4rem' }}>
        <ScrollReveal direction="up">
          <div className="section-title-row">
            <h2 className="section-title">Best Sellers</h2>
            <span style={{ fontSize: '0.9rem', color: 'var(--brand-teal)', fontWeight: 600 }}>★ Highly Purchased Products</span>
          </div>
        </ScrollReveal>

        {loading ? (
          <div className="loading-screen"><div className="spinner" /></div>
        ) : (
          <div className="product-grid">
            {bestSellers.map((p, idx) => {
              const originalPrice = parseFloat(p.price);
              const hasDiscount = p.discount_percent > 0;
              const discountPrice = hasDiscount ? originalPrice * (1 - p.discount_percent / 100) : originalPrice;
              const isWishlisted = wishlist.some(item => item.id === p.id);
              return (
                <ScrollReveal key={p.id} delay={(idx % 3) * 100} threshold={0.05}>
                  <div className="product-card">
                    <div className="product-img-wrapper">
                      <img src={getImageUrl(p.image_urls && p.image_urls[0] ? p.image_urls[0] : p.image_url)} alt={p.name} className="product-img" />
                      {hasDiscount && (
                        <div className="discount-badge">{p.discount_percent}% OFF</div>
                      )}
                      {user && (
                        <button 
                          className={`wishlist-btn ${isWishlisted ? 'active' : ''}`}
                          onClick={() => toggleWishlist(p)}
                          aria-label="Toggle wishlist"
                          style={{
                            position: 'absolute',
                            top: '12px',
                            right: '12px',
                            zIndex: 10,
                            background: 'rgba(255, 255, 255, 0.9)',
                            border: 'none',
                            borderRadius: '50%',
                            width: '32px',
                            height: '32px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer',
                            color: isWishlisted ? 'var(--color-cancelled)' : 'var(--text-secondary)',
                            boxShadow: 'var(--shadow-sm)',
                            transition: 'color 0.2s, background-color 0.2s'
                          }}
                        >
                          <HeartIcon />
                        </button>
                      )}
                      <div className="product-hover-overlay">
                        <div className="hover-actions">
                          <button className="btn btn-teal" onClick={() => addToCart({ ...p, price: discountPrice, image_url: p.image_urls && p.image_urls[0] ? p.image_urls[0] : p.image_url })}>Add to Bag</button>
                          <button className="btn-outline-white" onClick={() => navigate(`/product/${p.id}`)}>Quick View</button>
                        </div>
                      </div>
                    </div>
                    <div className="product-info">
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <h3 className="product-name">{p.name}</h3>
                        <div className="product-pricing">
                          {hasDiscount ? (
                            <>
                              <span className="discount-price">₹{discountPrice.toFixed(2)}</span>
                              <span className="original-price">₹{originalPrice.toFixed(2)}</span>
                            </>
                          ) : (
                            <span className="discount-price">₹{originalPrice.toFixed(2)}</span>
                          )}
                        </div>
                      </div>
                      <p className="product-desc">{p.description}</p>
                      {p.sales_count > 0 && (
                        <div style={{ fontSize: '0.78rem', color: 'var(--color-primary, #e67e22)', fontWeight: 600, marginTop: '0.25rem' }}>
                          🔥 {p.sales_count} purchased
                        </div>
                      )}
                    </div>
                  </div>
                </ScrollReveal>
              );
            })}
            {bestSellers.length === 0 && (
              <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '2rem', color: 'var(--text-secondary)' }}>
                No products purchased yet.
              </div>
            )}
          </div>
        )}
      </section>

    </div>
  );
}
