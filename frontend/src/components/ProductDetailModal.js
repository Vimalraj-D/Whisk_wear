import React, { useState } from 'react';
import { getImageUrl } from '../api';
import ReviewSection from './ReviewSection';
import ImageWithSkeleton from './ImageWithSkeleton';

export default function ProductDetailModal({ product, user, onClose, addToCart, openCart }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedSize, setSelectedSize] = useState(product.sizes && product.sizes.length > 0 ? product.sizes[0] : '');
  const [selectedColor, setSelectedColor] = useState(product.colors && product.colors.length > 0 ? product.colors[0] : '');
  const [zoomScale, setZoomScale] = useState(1);
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [startPan, setStartPan] = useState({ x: 0, y: 0 });

  const images = product.image_urls && product.image_urls.length > 0 ? product.image_urls : [product.image_url];
  const originalPrice = parseFloat(product.price);
  const hasDiscount = product.discount_percent > 0;
  const discountPrice = hasDiscount ? originalPrice * (1 - product.discount_percent / 100) : originalPrice;

  const prev = () => {
    setZoomScale(1);
    setPanOffset({ x: 0, y: 0 });
    setCurrentIndex((i) => (i === 0 ? images.length - 1 : i - 1));
  };
  const next = () => {
    setZoomScale(1);
    setPanOffset({ x: 0, y: 0 });
    setCurrentIndex((i) => (i === images.length - 1 ? 0 : i + 1));
  };

  const handleZoomIn = () => setZoomScale(prev => Math.min(prev + 0.5, 3));
  const handleZoomOut = () => {
    setZoomScale(prev => {
      const nextScale = Math.max(prev - 0.5, 1);
      if (nextScale === 1) setPanOffset({ x: 0, y: 0 });
      return nextScale;
    });
  };

  // Simple drag-to-pan when zoomed
  const handleMouseDown = (e) => {
    if (zoomScale <= 1) return;
    setIsPanning(true);
    setStartPan({ x: e.clientX - panOffset.x, y: e.clientY - panOffset.y });
  };

  const handleMouseMove = (e) => {
    if (!isPanning) return;
    const x = e.clientX - startPan.x;
    const y = e.clientY - startPan.y;
    setPanOffset({ x, y });
  };

  const handleMouseUpOrLeave = () => {
    setIsPanning(false);
  };

  const handleAddClick = () => {
    const cartPayload = {
      ...product,
      id: product.id,
      price: discountPrice,
      selectedSize,
      selectedColor,
      image_url: images[0]
    };
    addToCart(cartPayload);
    onClose();
  };

  const handleBuyNowClick = () => {
    const cartPayload = {
      ...product,
      id: product.id,
      price: discountPrice,
      selectedSize,
      selectedColor,
      image_url: images[0]
    };
    addToCart(cartPayload);
    onClose();
    if (openCart) {
      setTimeout(() => {
        openCart();
      }, 100);
    }
  };

  return (
    <div style={overlayStyle} onClick={onClose}>
      <div style={containerStyle} onClick={e => e.stopPropagation()}>
        {/* Close Button */}
        <button style={closeBtnStyle} onClick={onClose}>×</button>

        <div style={modalGridStyle}>
          {/* Visual Column */}
          <div style={visualColumnStyle}>
            {/* Image viewport with overflow hidden */}
            <div 
              style={viewportStyle}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUpOrLeave}
              onMouseLeave={handleMouseUpOrLeave}
            >
              <img 
                src={getImageUrl(images[currentIndex])} 
                alt={product.name} 
                onError={(e) => { e.target.onerror = null; e.target.src = 'https://images.unsplash.com/photo-1558769132-cb1fac08b475?w=500'; }}
                style={{
                  ...imageStyle,
                  transform: `scale(${zoomScale}) translate(${panOffset.x / zoomScale}px, ${panOffset.y / zoomScale}px)`,
                  cursor: zoomScale > 1 ? 'grab' : 'zoom-in'
                }} 
              />

              {/* Discount Tag */}
              {hasDiscount && (
                <div style={discountTagStyle}>
                  {product.discount_percent}% OFF
                </div>
              )}
            </div>

            {/* Gallery Control Row */}
            <div style={controlRowStyle}>
              {images.length > 1 && (
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button onClick={prev} style={circleBtnStyle}>←</button>
                  <button onClick={next} style={circleBtnStyle}>→</button>
                </div>
              )}
              {/* Zoom Buttons */}
              <div style={{ display: 'flex', gap: '0.5rem', marginLeft: 'auto' }}>
                <button onClick={handleZoomOut} style={zoomBtnStyle}>Zoom −</button>
                <span style={{ fontSize: '0.85rem', alignSelf: 'center', minWidth: '35px', textAlign: 'center', fontWeight: 600 }}>{Math.round(zoomScale * 100)}%</span>
                <button onClick={handleZoomIn} style={zoomBtnStyle}>Zoom +</button>
              </div>
            </div>
            {zoomScale > 1 && (
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', textAlign: 'center', marginTop: '0.25rem' }}>
                Drag image to pan and explore texture
              </div>
            )}
          </div>

          {/* Details Column */}
          <div style={detailsColumnStyle}>
            <span style={{ textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: '2px', color: 'var(--brand-teal)', fontWeight: 700 }}>
              {product.category === 'kids_wear' ? "Kids Wear Collection" : "Kitchen Essentials"}
            </span>
            <h2 style={{ fontSize: '1.8rem', fontWeight: 800, margin: '0.5rem 0', color: 'var(--text-primary)' }}>{product.name}</h2>
            
            {/* Pricing Details */}
            <div style={priceContainerStyle}>
              {hasDiscount ? (
                <>
                  <span style={discountPriceStyle}>₹{discountPrice.toFixed(2)}</span>
                  <span style={originalPriceStyle}>₹{originalPrice.toFixed(2)}</span>
                </>
              ) : (
                <span style={discountPriceStyle}>₹{originalPrice.toFixed(2)}</span>
              )}
            </div>

            <p style={descStyle}>{product.description}</p>

            {/* Sizes Selection */}
            {product.sizes && product.sizes.length > 0 && (
              <div style={{ marginBottom: '1.5rem' }}>
                <h4 style={labelStyle}>Select Size</h4>
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                  {product.sizes.map(size => (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      style={{
                        ...sizeOptionStyle,
                        border: selectedSize === size ? '2px solid var(--brand-teal)' : '1px solid #ccc',
                        background: selectedSize === size ? 'rgba(0, 168, 204, 0.1)' : 'transparent',
                        color: selectedSize === size ? 'var(--brand-teal)' : 'var(--text-primary)'
                      }}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Colors Selection */}
            {product.colors && product.colors.length > 0 && (
              <div style={{ marginBottom: '1.5rem' }}>
                <h4 style={labelStyle}>Select Color</h4>
                <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                  {product.colors.map(color => (
                    <button
                      key={color}
                      onClick={() => setSelectedColor(color)}
                      style={{
                        ...colorOptionStyle,
                        backgroundColor: color,
                        boxShadow: selectedColor === color ? `0 0 0 3px #fff, 0 0 0 5px var(--brand-teal)` : 'none'
                      }}
                      title={color}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* CTA Shop Buttons */}
            <div style={{ marginTop: 'auto', paddingTop: '1.5rem', display: 'flex', gap: '0.85rem' }}>
              <button style={addToBagBtnStyle} onClick={handleAddClick}>
                Add to Bag
              </button>
              <button style={buyNowBtnStyle} onClick={handleBuyNowClick}>
                Buy Now
              </button>
            </div>

            {/* Review Section */}
            <ReviewSection productId={product.id} user={user} />
          </div>
        </div>
      </div>
    </div>
  );
}

// Styling details for futuristic look
const overlayStyle = {
  position: 'fixed',
  inset: 0,
  backgroundColor: 'rgba(10, 17, 30, 0.7)',
  backdropFilter: 'blur(16px)',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  zIndex: 1100,
  padding: '1.5rem'
};

const containerStyle = {
  background: 'rgba(255, 255, 255, 0.82)',
  border: '1px solid rgba(255, 255, 255, 0.3)',
  borderRadius: '24px',
  boxShadow: '0 24px 64px -16px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.6)',
  maxWidth: '920px',
  width: '100%',
  maxHeight: '90vh',
  position: 'relative',
  overflowY: 'auto',
  color: '#2d3436'
};

const closeBtnStyle = {
  position: 'absolute',
  top: '1.25rem',
  right: '1.25rem',
  background: 'rgba(0,0,0,0.05)',
  border: 'none',
  width: '36px',
  height: '36px',
  borderRadius: '50%',
  fontSize: '1.3rem',
  cursor: 'pointer',
  zIndex: 10,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  transition: 'background 0.2s',
  color: 'var(--text-primary)'
};

const modalGridStyle = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))',
  minHeight: '480px'
};

const visualColumnStyle = {
  padding: '2.5rem',
  background: 'rgba(240, 243, 246, 0.5)',
  borderRight: '1px solid rgba(0,0,0,0.05)',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center'
};

const viewportStyle = {
  position: 'relative',
  width: '100%',
  height: '320px',
  borderRadius: '16px',
  overflow: 'hidden',
  background: '#fff',
  boxShadow: '0 8px 24px rgba(0,0,0,0.04)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center'
};

const imageStyle = {
  maxWidth: '100%',
  maxHeight: '100%',
  objectFit: 'contain',
  transition: 'transform 0.15s ease-out'
};

const discountTagStyle = {
  position: 'absolute',
  top: '1rem',
  left: '1rem',
  background: 'var(--brand-teal, #00a8cc)',
  color: '#fff',
  padding: '0.4rem 0.8rem',
  borderRadius: '50px',
  fontSize: '0.78rem',
  fontWeight: 800,
  boxShadow: '0 8px 16px rgba(0, 168, 204, 0.3)'
};

const controlRowStyle = {
  display: 'flex',
  alignItems: 'center',
  marginTop: '1rem'
};

const circleBtnStyle = {
  background: '#fff',
  border: '1px solid #ddd',
  width: '38px',
  height: '38px',
  borderRadius: '50%',
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  boxShadow: '0 4px 10px rgba(0,0,0,0.05)',
  fontSize: '0.9rem',
  fontWeight: 700
};

const zoomBtnStyle = {
  background: 'rgba(0,0,0,0.04)',
  border: 'none',
  padding: '0.4rem 0.8rem',
  borderRadius: '8px',
  cursor: 'pointer',
  fontSize: '0.8rem',
  fontWeight: 600
};

const detailsColumnStyle = {
  padding: '2.5rem',
  display: 'flex',
  flexDirection: 'column'
};

const priceContainerStyle = {
  display: 'flex',
  alignItems: 'baseline',
  gap: '0.75rem',
  margin: '0.5rem 0 1rem 0'
};

const discountPriceStyle = {
  fontSize: '1.8rem',
  fontWeight: 800,
  color: 'var(--brand-teal)'
};

const originalPriceStyle = {
  fontSize: '1.1rem',
  textDecoration: 'line-through',
  color: '#999'
};

const descStyle = {
  fontSize: '0.92rem',
  color: 'var(--text-secondary, #666)',
  lineHeight: 1.6,
  marginBottom: '1.5rem'
};

const labelStyle = {
  fontSize: '0.85rem',
  fontWeight: 700,
  textTransform: 'uppercase',
  letterSpacing: '1px',
  marginBottom: '0.5rem',
  color: 'var(--text-primary)'
};

const sizeOptionStyle = {
  padding: '0.4rem 1rem',
  borderRadius: '8px',
  fontSize: '0.82rem',
  fontWeight: 700,
  cursor: 'pointer',
  transition: 'all 0.2s'
};

const colorOptionStyle = {
  width: '28px',
  height: '28px',
  borderRadius: '50%',
  border: '1px solid rgba(0,0,0,0.1)',
  cursor: 'pointer',
  transition: 'box-shadow 0.2s'
};

const addToBagBtnStyle = {
  background: 'rgba(255, 255, 255, 0.95)',
  color: 'var(--brand-navy, #2f4156)',
  width: '50%',
  padding: '0.85rem',
  border: '1px solid rgba(0,0,0,0.15)',
  borderRadius: '50px',
  fontSize: '0.92rem',
  fontWeight: 700,
  cursor: 'pointer',
  transition: 'all 0.2s',
  textAlign: 'center'
};

const buyNowBtnStyle = {
  background: 'linear-gradient(135deg, var(--brand-teal) 0%, #008fae 100%)',
  color: '#fff',
  width: '50%',
  padding: '0.85rem',
  border: 'none',
  borderRadius: '50px',
  fontSize: '0.92rem',
  fontWeight: 700,
  cursor: 'pointer',
  boxShadow: '0 8px 16px rgba(0, 168, 204, 0.35)',
  transition: 'all 0.2s',
  textAlign: 'center'
};
