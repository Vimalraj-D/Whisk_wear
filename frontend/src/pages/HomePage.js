import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiService, getImageUrl } from '../api';
import ProductDetailModal from '../components/ProductDetailModal';
import ImageWithSkeleton from '../components/ImageWithSkeleton';
import ScrollReveal from '../components/ScrollReveal';

export default function HomePage({ user, addToCart, openCart, showToast }) {
  const navigate = useNavigate();
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [bestSellers, setBestSellers] = useState([]);
  const [detailProduct, setDetailProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState([]);
  
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
  const videoUrls = [
    'https://aoppjuuqdgajcidduqld.supabase.co/storage/v1/object/public/Images/video/i_not_need_whisk_wear_text_in.mp4', // #video url 1
    'https://aoppjuuqdgajcidduqld.supabase.co/storage/v1/object/public/Images/video/like_this_for_chef_appearl_for.mp4',     // #video url 2
    'https://aoppjuuqdgajcidduqld.supabase.co/storage/v1/object/public/Images/video/it_is_for_both_hotel_and_home.mp4'      // #video url 3
  ];

  const handleVideoEnded = () => {
    setCurrentVideoIdx((prev) => (prev + 1) % videoUrls.length);
  };
  const prevVideo = () => {
    setCurrentVideoIdx((prev) => (prev === 0 ? videoUrls.length - 1 : prev - 1));
  };
  const nextVideo = () => {
    setCurrentVideoIdx((prev) => (prev + 1) % videoUrls.length);
  };

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
          <ImageWithSkeleton src={slide.img} alt="Featured" className="hero-product-img" style={{ zIndex: 2, borderRadius: slide.img.includes('unsplash') ? '50%' : '0' }} />
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
              return (
                <ScrollReveal key={p.id} delay={(idx % 4) * 100} threshold={0.05}>
                  <div className="product-card">
                    <div className="product-img-wrapper">
                      <ImageWithSkeleton src={getImageUrl(p.image_urls && p.image_urls[0] ? p.image_urls[0] : p.image_url)} alt={p.name} className="product-img" style={{ position: 'absolute', inset: 0 }} />
                      {hasDiscount && (
                        <div className="discount-badge">{p.discount_percent}% OFF</div>
                      )}
                      <div className="product-hover-overlay">
                        <div className="hover-actions">
                          <button className="btn btn-teal" onClick={() => addToCart({ ...p, price: discountPrice, image_url: p.image_urls && p.image_urls[0] ? p.image_urls[0] : p.image_url })}>Add to Bag</button>
                          <button className="btn-outline-white" onClick={() => setDetailProduct(p)}>Quick View</button>
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
            <span style={{ fontSize: '0.9rem', color: 'var(--brand-teal)', fontWeight: 600 }}>✦ Play Automatically</span>
          </div>

          <div style={{ position: 'relative', overflow: 'hidden', width: '100%', height: '480px', borderRadius: '16px', background: '#000', boxShadow: 'var(--shadow-lg)' }}>
            {/* Sliding Track */}
            <div style={{
              display: 'flex',
              transform: `translateX(-${currentVideoIdx * 100}%)`,
              transition: 'transform 0.8s cubic-bezier(0.16, 1, 0.3, 1)',
              width: '100%',
              height: '100%'
            }}>
              {videoUrls.map((url, idx) => (
                <div key={idx} style={{ minWidth: '100%', height: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                  <video
                    src={url}
                    controls
                    autoPlay={idx === currentVideoIdx}
                    muted
                    onEnded={handleVideoEnded}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                </div>
              ))}
            </div>

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
              {videoUrls.map((_, idx) => (
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
              return (
                <ScrollReveal key={p.id} delay={(idx % 3) * 100} threshold={0.05}>
                  <div className="product-card">
                    <div className="product-img-wrapper">
                      <img src={getImageUrl(p.image_urls && p.image_urls[0] ? p.image_urls[0] : p.image_url)} alt={p.name} className="product-img" />
                      {hasDiscount && (
                        <div className="discount-badge">{p.discount_percent}% OFF</div>
                      )}
                      <div className="product-hover-overlay">
                        <div className="hover-actions">
                          <button className="btn btn-teal" onClick={() => addToCart({ ...p, price: discountPrice, image_url: p.image_urls && p.image_urls[0] ? p.image_urls[0] : p.image_url })}>Add to Bag</button>
                          <button className="btn-outline-white" onClick={() => setDetailProduct(p)}>Quick View</button>
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

      {detailProduct && (
        <ProductDetailModal 
          product={detailProduct} 
          user={user}
          onClose={() => setDetailProduct(null)} 
          addToCart={addToCart} 
          openCart={openCart}
        />
      )}
    </div>
  );
}
