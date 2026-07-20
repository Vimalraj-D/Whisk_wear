import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import './Parallax3DFashion.css';

const FASHION_3D_ITEMS = [
  {
    id: 'chef-tech',
    category: 'Haute Culinary Gear',
    badge: '3D THERMO-WEAVE',
    title: 'Hyper-Weave Chef Uniforms',
    desc: 'Crafted with nano-fiber heat-diffusing technology, liquid-repellent weave, and ergonomic zero-gravity flex joints.',
    img: 'https://aoppjuuqdgajcidduqld.supabase.co/storage/v1/object/public/Images/ChatGPT%20Image%20Jul%207,%202026,%2001_24_35%20AM.png',
    tags: ['Thermodynamic', 'Stain-Shield', 'Flex-Fit'],
    colorDots: ['#00f2fe', '#4facfe', '#8a2be2'],
    queryCategory: 'chef_wear'
  },
  {
    id: 'kids-eco',
    category: 'Futuristic Kids Apparel',
    badge: 'ORGANIC CLOUD-COTTON',
    title: 'Bio-Organic Playwear',
    desc: '100% GOTS-certified organic long-staple cotton with zero chemical dyes, offering cloud-like softness and active durability.',
    img: 'https://aoppjuuqdgajcidduqld.supabase.co/storage/v1/object/public/Images/ChatGPT%20Image%20Jul%207,%202026,%2001_15_10%20AM.png',
    tags: ['Zero-Chemical', 'Ultra-Breathable', 'Eco-Cotton'],
    colorDots: ['#f43f5e', '#fb7185', '#fda4af'],
    queryCategory: 'kids_wear'
  },
  {
    id: 'kitchen-absorb',
    category: 'Smart Kitchen Textiles',
    badge: 'QUANTUM-NANO FIBER',
    title: 'Micro-Fiber Kitchen Weave',
    desc: 'High-density capillary absorption technology that locks in 10x moisture while drying 4x faster than standard linen.',
    img: 'https://aoppjuuqdgajcidduqld.supabase.co/storage/v1/object/public/Images/ChatGPT%20Image%20Jul%207,%202026,%2001_19_21%20AM.png',
    tags: ['10x Absorption', 'Fast-Dry', 'Anti-Bacterial'],
    colorDots: ['#10b981', '#34d399', '#6ee7b7'],
    queryCategory: 'kitchen_cloths'
  }
];

export default function Parallax3DFashion() {
  const navigate = useNavigate();
  const sectionRef = useRef(null);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [cardTilts, setCardTilts] = useState({});

  // Handle scroll parallax calculation
  useEffect(() => {
    let animationFrameId;

    const handleScroll = () => {
      if (!sectionRef.current) return;
      const rect = sectionRef.current.getBoundingClientRect();
      const windowHeight = window.innerHeight;
      
      // Calculate how far section has scrolled through viewport (0 to 1)
      const progress = (windowHeight - rect.top) / (windowHeight + rect.height);
      const clampedProgress = Math.max(0, Math.min(1, progress));
      
      animationFrameId = requestAnimationFrame(() => {
        setScrollProgress(clampedProgress);
      });
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll(); // Initial run

    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
    };
  }, []);

  // Handle 3D Mouse Tilt per card
  const handleMouseMove = (e, id) => {
    const card = e.currentTarget;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left; // x position within element
    const y = e.clientY - rect.top;  // y position within element
    
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    
    // Calculate tilt (-15deg to +15deg)
    const rotateX = -((y - centerY) / centerY) * 14;
    const rotateY = ((x - centerX) / centerX) * 14;

    setCardTilts(prev => ({
      ...prev,
      [id]: { rotateX, rotateY, translateZ: 35 }
    }));
  };

  const handleMouseLeave = (id) => {
    setCardTilts(prev => ({
      ...prev,
      [id]: { rotateX: 0, rotateY: 0, translateZ: 0 }
    }));
  };

  // Parallax offsets
  const bgGridY = (scrollProgress - 0.5) * 60;
  const floatingOrbY1 = (scrollProgress - 0.5) * -100;
  const floatingOrbY2 = (scrollProgress - 0.5) * 120;
  const accentRingZ = Math.sin(scrollProgress * Math.PI) * 40;

  return (
    <section ref={sectionRef} className="parallax-3d-section">
      {/* Dynamic Parallax Background Grid */}
      <div 
        className="parallax-bg-grid" 
        style={{ transform: `translateY(${bgGridY}px) scale(1.05)` }} 
      />

      {/* Floating Glowing Ambient Orbs */}
      <div 
        className="parallax-glow-orb parallax-glow-1" 
        style={{ transform: `translateY(${floatingOrbY1}px)` }} 
      />
      <div 
        className="parallax-glow-orb parallax-glow-2" 
        style={{ transform: `translateY(${floatingOrbY2}px)` }} 
      />
      <div className="parallax-glow-orb parallax-glow-3" />

      {/* Floating 3D Geometric Accents */}
      <div 
        className="parallax-floating-3d-accent accent-ring-1" 
        style={{ transform: `translateZ(${accentRingZ}px) translateY(${floatingOrbY1 * 0.4}px)` }} 
      />
      <div 
        className="parallax-floating-3d-accent accent-ring-2" 
        style={{ transform: `translateZ(${accentRingZ * 1.5}px) translateY(${floatingOrbY2 * 0.4}px)` }} 
      />

      {/* Floating Tech Badges on Scroll */}
      <div 
        className="parallax-floating-3d-accent floating-tech-tag"
        style={{ 
          top: '22%', 
          left: '4%', 
          transform: `translate3d(0, ${(scrollProgress - 0.5) * -90}px, 50px) rotate(-6deg)` 
        }}
      >
        ✦ 3D FABRIC MATRIX
      </div>

      <div 
        className="parallax-floating-3d-accent floating-tech-tag"
        style={{ 
          bottom: '24%', 
          right: '5%', 
          transform: `translate3d(0, ${(scrollProgress - 0.5) * 110}px, 60px) rotate(8deg)`,
          borderColor: '#8a2be2',
          color: '#c084fc'
        }}
      >
        ⚡ ZERO-GRAVITY FIT
      </div>

      {/* Section Header */}
      <div className="parallax-header">
        <div className="parallax-badge-pill">
          <span>❖</span> Futuristic Design System
        </div>
        <h2 className="parallax-title">
          Next-Gen 3D Fashion Engineering
        </h2>
        <p className="parallax-subtitle">
          Immerse yourself in our high-tech apparel matrix where ergonomic 3D tailoring, bio-organic cottons, and hydrophobic fabrics redefine modern lifestyle & kitchen attire.
        </p>
      </div>

      {/* 3D Interactive Cards Grid */}
      <div className="parallax-cards-container">
        {FASHION_3D_ITEMS.map((item) => {
          const tilt = cardTilts[item.id] || { rotateX: 0, rotateY: 0, translateZ: 0 };
          
          return (
            <div
              key={item.id}
              className="parallax-3d-card"
              onMouseMove={(e) => handleMouseMove(e, item.id)}
              onMouseLeave={() => handleMouseLeave(item.id)}
              onClick={() => navigate(`/shop?category=${item.queryCategory}`)}
              style={{
                transform: `perspective(1000px) rotateX(${tilt.rotateX}deg) rotateY(${tilt.rotateY}deg) translateZ(${tilt.translateZ}px)`
              }}
            >
              {/* Floating 3D Badge */}
              <div className="card-3d-badge">{item.badge}</div>

              <div className="parallax-3d-card-inner">
                {/* 3D Depth Image Container */}
                <div className="card-img-container">
                  <img src={item.img} alt={item.title} className="card-3d-img" />
                  <div className="card-img-overlay-grid" />
                  
                  <div className="card-3d-tag-row">
                    {item.tags.map((tag, idx) => (
                      <span key={idx} className="card-3d-tag">{tag}</span>
                    ))}
                  </div>
                </div>

                {/* Card Content Info */}
                <div className="card-3d-content">
                  <span className="card-3d-category">{item.category}</span>
                  <h3 className="card-3d-title">{item.title}</h3>
                  <p className="card-3d-desc">{item.desc}</p>

                  <div className="card-3d-features">
                    <div className="specs-list">
                      {item.colorDots.map((c, i) => (
                        <span key={i} className="spec-dot" style={{ backgroundColor: c, color: c }} />
                      ))}
                    </div>
                    <button 
                      className="card-3d-action-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/shop?category=${item.queryCategory}`);
                      }}
                    >
                      EXPLORE <span>➔</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Floating Bottom Info Ribbon */}
      <div className="parallax-bottom-ribbon">
        <div className="ribbon-stats">
          <div className="ribbon-stat-item">
            <span className="ribbon-stat-val">100%</span>
            <span className="ribbon-stat-lbl">Eco-Certified</span>
          </div>
          <div className="ribbon-stat-item">
            <span className="ribbon-stat-val">3D Flex</span>
            <span className="ribbon-stat-lbl">Ergonomic Tailoring</span>
          </div>
          <div className="ribbon-stat-item">
            <span className="ribbon-stat-val">4.9★</span>
            <span className="ribbon-stat-lbl">Chef & Home Tested</span>
          </div>
        </div>

        <button 
          className="card-3d-action-btn" 
          style={{ padding: '0.75rem 1.6rem', fontSize: '0.9rem' }}
          onClick={() => navigate('/shop')}
        >
          EXPLORE FULL 3D CATALOGUE ➔
        </button>
      </div>
    </section>
  );
}
