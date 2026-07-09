import React, { useState, useEffect } from 'react';
import { getImageUrl } from '../api';
import ReviewSection from './ReviewSection';

export default function ProductDetailModal({ product, user, onClose, addToCart, openCart }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedSize, setSelectedSize] = useState(product.sizes && product.sizes.length > 0 ? product.sizes[0] : 'Standard');
  const [selectedColor, setSelectedColor] = useState(product.colors && product.colors.length > 0 ? product.colors[0] : '');
  const [quantity, setQuantity] = useState(1);
  const [wantsEmbroidery, setWantsEmbroidery] = useState(false);
  const [is360Active, setIs360Active] = useState(false);
  const [spinAngle, setSpinAngle] = useState(0);
  const [wishlisted, setWishlisted] = useState(false);

  const images = product.image_urls && product.image_urls.length > 0 ? product.image_urls : [product.image_url];
  const originalPrice = parseFloat(product.price);
  const hasDiscount = product.discount_percent > 0;
  const discountPrice = hasDiscount ? originalPrice * (1 - product.discount_percent / 100) : originalPrice;
  const itemSku = `ABN0${product.id || 7}BLK${selectedColor ? selectedColor.slice(1, 3).toUpperCase() : '0'}`;

  // 360 spin animation effect
  useEffect(() => {
    let interval;
    if (is360Active) {
      interval = setInterval(() => {
        // If there are multiple images, cycle through them
        if (images.length > 1) {
          setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
        } else {
          // If only one image, rotate it via 3D CSS
          setSpinAngle((prevAngle) => (prevAngle + 15) % 360);
        }
      }, 150);
    } else {
      setSpinAngle(0);
    }
    return () => clearInterval(interval);
  }, [is360Active, images.length]);

  const handleAddClick = () => {
    const cartPayload = {
      ...product,
      id: product.id,
      price: discountPrice,
      selectedSize,
      selectedColor,
      quantity: quantity,
      embroidery: wantsEmbroidery,
      image_url: images[0]
    };
    addToCart(cartPayload);
    onClose();
  };

  const handleQtyChange = (val) => {
    setQuantity((q) => Math.max(1, Math.min(product.stock || 99, q + val)));
  };

  const toggle360 = () => {
    setIs360Active(!is360Active);
  };

  return (
    <div style={overlayStyle} onClick={onClose}>
      <div style={containerStyle} onClick={(e) => e.stopPropagation()}>
        {/* Close Button */}
        <button style={closeBtnStyle} onClick={onClose}>×</button>

        <div style={modalGridStyle}>
          {/* Column 1: Vertical Gallery Thumbnails */}
          <div style={thumbnailColumnStyle}>
            {images.map((img, idx) => (
              <div
                key={idx}
                style={{
                  ...thumbnailWrapperStyle,
                  borderColor: currentIndex === idx && !is360Active ? '#c21e25' : '#ddd',
                }}
                onClick={() => {
                  setIs360Active(false);
                  setCurrentIndex(idx);
                }}
              >
                <img
                  src={getImageUrl(img)}
                  alt={`thumb-${idx}`}
                  style={thumbnailImageStyle}
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = 'https://images.unsplash.com/photo-1558769132-cb1fac08b475?w=100';
                  }}
                />
              </div>
            ))}

            {/* 360 Spin Thumbnail Button */}
            <div
              style={{
                ...thumbnailWrapperStyle,
                borderColor: is360Active ? '#c21e25' : '#ddd',
                background: '#f8f9fa',
              }}
              onClick={toggle360}
            >
              <div style={icon360Style}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#2d3436" strokeWidth="2">
                  <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67"/>
                </svg>
                <span style={{ fontSize: '0.65rem', fontWeight: 'bold', marginTop: '2px' }}>360°</span>
              </div>
            </div>
          </div>

          {/* Column 2: Main Product Image Display */}
          <div style={imageDisplayColumnStyle}>
            <div style={mainImageContainerStyle}>
              <img
                src={getImageUrl(images[currentIndex])}
                alt={product.name}
                style={{
                  ...mainImageStyle,
                  transform: spinAngle ? `rotateY(${spinAngle}deg)` : 'none',
                  transition: is360Active ? 'none' : 'transform 0.3s ease',
                }}
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = 'https://images.unsplash.com/photo-1590794056226-79ef3a814c2c?w=500';
                }}
              />
              {hasDiscount && (
                <div style={discountBadgeStyle}>
                  {product.discount_percent}% OFF
                </div>
              )}
            </div>
          </div>

          {/* Column 3: Detailed Product Details Panel */}
          <div style={detailsColumnStyle}>
            {/* Header info */}
            <div>
              <span style={brandNameStyle}>BY WHISKWEAR</span>
              <h2 style={productTitleStyle}>{product.name}</h2>
              <div style={skuAndStockRowStyle}>
                <span style={skuStyle}>ITEM: {itemSku}</span>
                <span style={stockStatusStyle}>IN STOCK</span>
              </div>
            </div>

            {/* Price section */}
            <div style={priceRowStyle}>
              {hasDiscount ? (
                <>
                  <span style={priceStyle}>₹{discountPrice.toFixed(2)}</span>
                  <span style={originalPriceStyle}>₹{originalPrice.toFixed(2)}</span>
                </>
              ) : (
                <span style={priceStyle}>₹{originalPrice.toFixed(2)}</span>
              )}
            </div>

            {/* Divider */}
            <hr style={dividerStyle} />

            {/* Color Swatch Selection */}
            {product.colors && product.colors.length > 0 && (
              <div style={{ marginBottom: '1.25rem' }}>
                <h4 style={sectionLabelStyle}>Select Color: <span style={{ fontWeight: 'normal', textTransform: 'none' }}>{selectedColor}</span></h4>
                <div style={swatchContainerStyle}>
                  {product.colors.map((color) => (
                    <div key={color} style={swatchItemWrapperStyle}>
                      <button
                        onClick={() => setSelectedColor(color)}
                        style={{
                          ...swatchButtonStyle,
                          backgroundColor: color,
                          boxShadow: selectedColor === color ? '0 0 0 2px #fff, 0 0 0 4px #c21e25' : '0 0 0 1px #ddd',
                        }}
                        title={color}
                      />
                      <span style={swatchStockLabelStyle}>In Stock</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Size Selection */}
            {product.sizes && product.sizes.length > 0 && (
              <div style={{ marginBottom: '1.25rem' }}>
                <h4 style={sectionLabelStyle}>Select Size:</h4>
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                  {product.sizes.map((size) => (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      style={{
                        ...sizeButtonStyle,
                        borderColor: selectedSize === size ? '#c21e25' : '#ccc',
                        color: selectedSize === size ? '#c21e25' : '#2d3436',
                        background: selectedSize === size ? '#fdf2f2' : 'transparent',
                      }}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Alert Notifications Link */}
            <div style={alertContainerStyle}>
              <a href="#/login" onClick={(e) => { e.preventDefault(); alert("Login to receive price drop alerts!"); }} style={alertLinkStyle}>
                Click here to login and receive notifications when inventory is running low, or its price drops
              </a>
            </div>

            {/* Compare checklist item */}
            <div style={compareContainerStyle}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#2d3436" strokeWidth="2" style={{ marginRight: '6px' }}>
                <path d="M12 20V10M18 20V4M6 20V16"/>
              </svg>
              <span style={{ fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer' }} onClick={() => alert("Added to comparison list!")}>COMPARE</span>
            </div>

            {/* Embroidery Selection Container */}
            <div style={embroideryBoxStyle}>
              <label style={embroideryLabelStyle}>
                <span>YES, I WANT EMBROIDERY</span>
                <input
                  type="checkbox"
                  checked={wantsEmbroidery}
                  onChange={(e) => setWantsEmbroidery(e.target.checked)}
                  style={embroideryCheckboxStyle}
                />
              </label>
            </div>

            {/* Quantity Selector */}
            <div style={quantityContainerStyle}>
              <span style={qtyLabelStyle}>Quantity</span>
              <div style={stepperContainerStyle}>
                <button style={stepperButtonStyle} onClick={() => handleQtyChange(-1)}>−</button>
                <span style={stepperValueStyle}>{quantity}</span>
                <button style={stepperButtonStyle} onClick={() => handleQtyChange(1)}>+</button>
              </div>
              <div style={qtyStockTextContainerStyle}>
                <span style={{ fontSize: '0.7rem', color: '#2ecc71', fontWeight: 'bold' }}>IN STOCK</span>
              </div>
            </div>

            {/* Checkout Action Button Row */}
            <div style={actionRowStyle}>
              {/* Wishlist Button */}
              <button
                style={{
                  ...wishlistButtonStyle,
                  background: wishlisted ? '#fdf2f2' : '#f1f2f6',
                }}
                onClick={() => {
                  setWishlisted(!wishlisted);
                }}
                title="Add to Wishlist"
              >
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill={wishlisted ? '#c21e25' : 'none'}
                  stroke={wishlisted ? '#c21e25' : '#2d3436'}
                  strokeWidth="2.5"
                >
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                </svg>
              </button>

              {/* Add to Cart Button */}
              <button style={addToCartButtonStyle} onClick={handleAddClick}>
                ADD TO CART
              </button>
            </div>

            {/* Shipping & Returns Details */}
            <div style={shippingInfoStyle}>
              <div style={infoItemStyle}>
                <span>📦 Easy Returns</span>
              </div>
              <div style={infoItemStyle}>
                <span>🚚 Free Shipping on orders above ₹499</span>
              </div>
            </div>

            {/* Collapsible Reviews Section */}
            <hr style={dividerStyle} />
            <ReviewSection productId={product.id} user={user} />
          </div>
        </div>
      </div>
    </div>
  );
}

// styling elements to match Chef Works quick view design style
const overlayStyle = {
  position: 'fixed',
  inset: 0,
  backgroundColor: 'rgba(0, 0, 0, 0.45)',
  backdropFilter: 'blur(4px)',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  zIndex: 1200,
  padding: '1.5rem',
};

const containerStyle = {
  background: '#fff',
  borderRadius: '4px',
  boxShadow: '0 12px 36px rgba(0,0,0,0.15)',
  maxWidth: '1200px',
  width: '100%',
  maxHeight: '92vh',
  position: 'relative',
  overflowY: 'auto',
  color: '#2d3436',
  padding: '1.5rem',
};

const closeBtnStyle = {
  position: 'absolute',
  top: '1rem',
  right: '1rem',
  background: 'transparent',
  border: 'none',
  fontSize: '2rem',
  fontWeight: 'light',
  cursor: 'pointer',
  zIndex: 20,
  color: '#2d3436',
};

const modalGridStyle = {
  display: 'grid',
  gridTemplateColumns: '80px 1fr 1.2fr',
  gap: '1.5rem',
  alignItems: 'start',
};

const thumbnailColumnStyle = {
  display: 'flex',
  flexDirection: 'column',
  gap: '0.75rem',
};

const thumbnailWrapperStyle = {
  width: '74px',
  height: '74px',
  border: '1px solid #ddd',
  borderRadius: '2px',
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  overflow: 'hidden',
  padding: '2px',
  transition: 'border-color 0.2s',
};

const thumbnailImageStyle = {
  maxWidth: '100%',
  maxHeight: '100%',
  objectFit: 'contain',
};

const icon360Style = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  color: '#2d3436',
};

const imageDisplayColumnStyle = {
  border: '1px solid #eee',
  borderRadius: '2px',
  padding: '1rem',
  background: '#fcfcfc',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  height: '520px',
};

const mainImageContainerStyle = {
  position: 'relative',
  width: '100%',
  height: '100%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  perspective: '1000px',
};

const mainImageStyle = {
  maxWidth: '100%',
  maxHeight: '100%',
  objectFit: 'contain',
  backfaceVisibility: 'visible',
};

const discountBadgeStyle = {
  position: 'absolute',
  top: '0',
  left: '0',
  backgroundColor: '#c21e25',
  color: '#fff',
  padding: '4px 10px',
  fontSize: '0.75rem',
  fontWeight: 'bold',
  letterSpacing: '1px',
};

const detailsColumnStyle = {
  display: 'flex',
  flexDirection: 'column',
  paddingLeft: '0.5rem',
};

const brandNameStyle = {
  fontSize: '0.7rem',
  fontWeight: '900',
  letterSpacing: '1.5px',
  color: '#2d3436',
  textTransform: 'uppercase',
};

const productTitleStyle = {
  fontSize: '1.9rem',
  fontWeight: '700',
  margin: '4px 0',
  color: '#2d3436',
  fontFamily: 'system-ui, sans-serif',
};

const skuAndStockRowStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  fontSize: '0.75rem',
  color: '#555',
  marginTop: '4px',
};

const skuStyle = {
  letterSpacing: '0.5px',
};

const stockStatusStyle = {
  color: '#2ecc71',
  fontWeight: 'bold',
};

const priceRowStyle = {
  margin: '12px 0',
  display: 'flex',
  alignItems: 'baseline',
  gap: '10px',
};

const priceStyle = {
  fontSize: '1.65rem',
  fontWeight: '700',
  color: '#2d3436',
};

const originalPriceStyle = {
  fontSize: '1.1rem',
  textDecoration: 'line-through',
  color: '#999',
};

const dividerStyle = {
  border: 'none',
  borderTop: '1px solid #ddd',
  margin: '1rem 0',
  width: '100%',
};

const sectionLabelStyle = {
  fontSize: '0.85rem',
  fontWeight: 'bold',
  marginBottom: '6px',
  textTransform: 'uppercase',
  color: '#2d3436',
};

const swatchContainerStyle = {
  display: 'flex',
  gap: '12px',
  flexWrap: 'wrap',
  margin: '8px 0',
};

const swatchItemWrapperStyle = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: '2px',
};

const swatchButtonStyle = {
  width: '32px',
  height: '32px',
  borderRadius: '50%',
  border: 'none',
  cursor: 'pointer',
  transition: 'box-shadow 0.2s',
};

const swatchStockLabelStyle = {
  fontSize: '0.55rem',
  color: '#2ecc71',
};

const sizeButtonStyle = {
  padding: '6px 12px',
  border: '1px solid #ccc',
  borderRadius: '2px',
  fontSize: '0.8rem',
  fontWeight: 'bold',
  cursor: 'pointer',
  transition: 'all 0.2s',
};

const alertContainerStyle = {
  backgroundColor: '#f9f9f9',
  padding: '8px 12px',
  borderLeft: '2px solid #ddd',
  margin: '12px 0',
};

const alertLinkStyle = {
  fontSize: '0.75rem',
  color: '#2d3436',
  textDecoration: 'underline',
  cursor: 'pointer',
  lineHeight: '1.4',
};

const compareContainerStyle = {
  display: 'flex',
  alignItems: 'center',
  margin: '8px 0 12px 0',
  color: '#2d3436',
};

const embroideryBoxStyle = {
  border: '1px solid #ccc',
  padding: '10px 14px',
  margin: '8px 0 14px 0',
  background: '#fafafa',
};

const embroideryLabelStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  fontSize: '0.85rem',
  fontWeight: 'bold',
  color: '#2d3436',
  cursor: 'pointer',
  letterSpacing: '0.5px',
};

const embroideryCheckboxStyle = {
  width: '16px',
  height: '16px',
  cursor: 'pointer',
};

const quantityContainerStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '15px',
  margin: '14px 0',
};

const qtyLabelStyle = {
  fontSize: '0.9rem',
  fontWeight: 'bold',
  color: '#2d3436',
};

const stepperContainerStyle = {
  display: 'flex',
  border: '1px solid #ccc',
  borderRadius: '2px',
  overflow: 'hidden',
  height: '32px',
};

const stepperButtonStyle = {
  width: '32px',
  background: '#fff',
  border: 'none',
  fontSize: '1rem',
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  color: '#2d3436',
  fontWeight: 'bold',
};

const stepperValueStyle = {
  width: '36px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontSize: '0.9rem',
  borderLeft: '1px solid #eee',
  borderRight: '1px solid #eee',
  fontWeight: 'bold',
};

const qtyStockTextContainerStyle = {
  display: 'flex',
  flexDirection: 'column',
};

const actionRowStyle = {
  display: 'flex',
  gap: '10px',
  margin: '15px 0 10px 0',
  height: '46px',
};

const wishlistButtonStyle = {
  width: '50px',
  border: '1px solid #ddd',
  borderRadius: '50%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  cursor: 'pointer',
  transition: 'background-color 0.2s',
};

const addToCartButtonStyle = {
  flex: 1,
  backgroundColor: '#c21e25',
  color: '#fff',
  border: 'none',
  borderRadius: '24px',
  fontSize: '0.95rem',
  fontWeight: 'bold',
  cursor: 'pointer',
  letterSpacing: '1px',
  transition: 'background-color 0.2s',
};

const shippingInfoStyle = {
  display: 'flex',
  flexDirection: 'column',
  gap: '4px',
  margin: '10px 0',
  fontSize: '0.75rem',
  color: '#666',
};

const infoItemStyle = {
  display: 'flex',
  alignItems: 'center',
};
