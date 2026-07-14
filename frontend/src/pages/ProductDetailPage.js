import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { apiService, getImageUrl } from '../api';
import ReviewSection from '../components/ReviewSection';
import ImageWithSkeleton from '../components/ImageWithSkeleton';
import ScrollReveal from '../components/ScrollReveal';

export default function ProductDetailPage({ user, addToCart, openCart, showToast, wishlist = [], toggleWishlist }) {
  const { id } = useParams();
  const navigate = useNavigate();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedSize, setSelectedSize] = useState('Standard');
  const [selectedColor, setSelectedColor] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [wantsEmbroidery, setWantsEmbroidery] = useState(false);
  const [is360Active, setIs360Active] = useState(false);
  const [spinAngle, setSpinAngle] = useState(0);

  useEffect(() => {
    // Scroll to top when product ID changes
    window.scrollTo(0, 0);
    setLoading(true);
    setCurrentIndex(0);
    setIs360Active(false);
    setSpinAngle(0);
    setWantsEmbroidery(false);
    setQuantity(1);

    apiService.getProduct(id)
      .then(prod => {
        setProduct(prod);
        if (prod.sizes && prod.sizes.length > 0) {
          setSelectedSize(prod.sizes[0]);
        } else {
          setSelectedSize('Standard');
        }
        if (prod.colors && prod.colors.length > 0) {
          setSelectedColor(prod.colors[0]);
        } else {
          setSelectedColor('');
        }

        // Fetch related products
        apiService.getProducts()
          .then(allProducts => {
            const list = allProducts.data || allProducts;
            const filtered = list.filter(p => p.category_id === prod.category_id && p.id !== prod.id);
            setRelatedProducts(filtered.slice(0, 4));
          })
          .catch(() => {});
      })
      .catch(err => {
        showToast('Product not found.');
        navigate('/shop');
      })
      .finally(() => setLoading(false));
  }, [id, navigate, showToast]);

  // 360 spin animation effect
  useEffect(() => {
    let interval;
    if (is360Active && product) {
      const images = product.image_urls && product.image_urls.length > 0 ? product.image_urls : [product.image_url];
      interval = setInterval(() => {
        if (images.length > 1) {
          setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
        } else {
          setSpinAngle((prevAngle) => (prevAngle + 15) % 360);
        }
      }, 150);
    } else {
      setSpinAngle(0);
    }
    return () => clearInterval(interval);
  }, [is360Active, product]);

  if (loading) {
    return (
      <div className="product-detail-loading" style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="spinner" />
      </div>
    );
  }

  if (!product) return null;

  const images = product.image_urls && product.image_urls.length > 0 ? product.image_urls : [product.image_url];
  const originalPrice = parseFloat(product.price);
  const hasDiscount = product.discount_percent > 0;
  const discountPrice = hasDiscount ? originalPrice * (1 - product.discount_percent / 100) : originalPrice;
  const totalPrice = discountPrice * quantity;
  const itemSku = `ABN0${product.id || 7}BLK${selectedColor ? selectedColor.slice(1, 3).toUpperCase() : '0'}`;
  const isWishlisted = wishlist.some(item => item.id === product.id);

  const handleAddToCart = () => {
    if (product.stock <= 0) {
      showToast('Item is out of stock');
      return;
    }
    const cartPayload = {
      ...product,
      id: product.id,
      price: discountPrice,
      selectedSize,
      selectedColor,
      quantity,
      embroidery: wantsEmbroidery,
      image_url: images[0]
    };
    addToCart(cartPayload);
  };

  const handleBuyNow = () => {
    if (product.stock <= 0) {
      showToast('Item is out of stock');
      return;
    }
    handleAddToCart();
    openCart();
  };

  const handleQtyChange = (val) => {
    setQuantity((q) => Math.max(1, Math.min(product.stock || 99, q + val)));
  };

  const toggle360 = () => {
    setIs360Active(!is360Active);
  };

  // Convert category database key to display label
  const getCategoryLabel = () => {
    if (product.category === 'kitchen_cloths') return 'Kitchen Cloths';
    if (product.category === 'kids_wear') return "Kids Wear";
    return 'Products';
  };

  return (
    <div className="product-detail-page-container" style={{ padding: '2rem 5%', width: '100%', maxWidth: '1400px', margin: '0 auto' }}>
      {/* Breadcrumb path way */}
      <div className="product-detail-breadcrumbs" style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '2rem' }}>
        <Link to="/" style={{ color: 'var(--brand-purple)', fontWeight: 500 }}>Home</Link>
        <span style={{ margin: '0 8px' }}>/</span>
        <Link to="/shop" style={{ color: 'var(--brand-purple)', fontWeight: 500 }}>Shop</Link>
        <span style={{ margin: '0 8px' }}>/</span>
        <Link to={`/shop?category=${product.category}`} style={{ color: 'var(--brand-purple)', fontWeight: 500 }}>{getCategoryLabel()}</Link>
        <span style={{ margin: '0 8px' }}>/</span>
        <span style={{ color: 'var(--text-muted)' }}>{product.name}</span>
      </div>

      <div className="product-detail-main-grid" style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1.2fr) minmax(0, 0.8fr)', gap: '2.5rem', alignItems: 'start' }}>
        
        {/* Column 1: Image Gallery */}
        <div className="product-detail-gallery-column" style={{ display: 'flex', gap: '1rem' }}>
          {/* Vertical Gallery Thumbnails */}
          <div className="product-detail-thumbnails" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', width: '74px', flexShrink: 0 }}>
            {images.map((img, idx) => (
              <div
                key={idx}
                style={{
                  width: '74px',
                  height: '74px',
                  border: '2px solid',
                  borderColor: currentIndex === idx && !is360Active ? 'var(--brand-purple)' : 'var(--border-color)',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  overflow: 'hidden',
                  padding: '2px',
                  background: 'var(--bg-card)',
                  transition: 'border-color 0.2s',
                }}
                onClick={() => {
                  setIs360Active(false);
                  setCurrentIndex(idx);
                }}
              >
                <img
                  src={getImageUrl(img)}
                  alt={`thumb-${idx}`}
                  style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
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
                width: '74px',
                height: '74px',
                border: '2px solid',
                borderColor: is360Active ? 'var(--brand-purple)' : 'var(--border-color)',
                borderRadius: '8px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'var(--bg-secondary)',
                flexDirection: 'column',
                color: 'var(--text-primary)',
              }}
              onClick={toggle360}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67"/>
              </svg>
              <span style={{ fontSize: '0.65rem', fontWeight: 'bold', marginTop: '2px' }}>360°</span>
            </div>
          </div>

          {/* Main Product Image Display */}
          <div className="product-detail-main-image" style={{ flexGrow: 1, border: '1px solid var(--border-color)', borderRadius: '16px', padding: '1.5rem', background: 'var(--bg-card)', display: 'flex', alignItems: 'center', justifyContent: 'center', height: '480px', position: 'relative' }}>
            <img
              src={getImageUrl(images[currentIndex])}
              alt={product.name}
              style={{
                maxWidth: '100%',
                maxHeight: '100%',
                objectFit: 'contain',
                transform: spinAngle ? `rotateY(${spinAngle}deg)` : 'none',
                transition: is360Active ? 'none' : 'transform 0.3s ease',
              }}
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = 'https://images.unsplash.com/photo-1590794056226-79ef3a814c2c?w=500';
              }}
            />
            {hasDiscount && (
              <div className="discount-badge" style={{ position: 'absolute', top: '16px', left: '16px', backgroundColor: 'var(--brand-purple)', color: '#fff', padding: '4px 10px', fontSize: '0.75rem', fontWeight: 'bold', borderRadius: '4px' }}>
                {product.discount_percent}% OFF
              </div>
            )}
          </div>
        </div>

        {/* Column 2: Detailed Product Details Panel */}
        <div className="product-detail-info-column" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div>
            <span style={{ fontSize: '0.8rem', fontWeight: '800', letterSpacing: '1.5px', color: 'var(--brand-purple)', textTransform: 'uppercase' }}>BY WHISKWEAR</span>
            <h1 style={{ fontSize: '2.5rem', fontWeight: '800', color: 'var(--text-primary)', margin: '4px 0', fontFamily: 'var(--font-serif)', lineHeight: 1.2 }}>{product.name}</h1>
            
            {/* Rating summary */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '8px' }}>
              <div style={{ display: 'flex', gap: '2px', alignItems: 'center' }}>
                {[1, 2, 3, 4, 5].map(star => (
                  <svg key={star} xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill={star <= 4 ? "#F59E0B" : "none"} stroke="#F59E0B" strokeWidth="2">
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
                  </svg>
                ))}
              </div>
              <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>4.0 out of 5 stars</span>
              <span style={{ color: 'var(--border-color)' }}>|</span>
              <a href="#reviews-section" style={{ fontSize: '0.875rem', color: 'var(--brand-purple)', textDecoration: 'none', fontWeight: 600 }}>Customer Reviews</a>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '8px' }}>
              <span>SKU: {itemSku}</span>
            </div>
          </div>

          <hr style={{ border: 'none', borderTop: '1px solid var(--border-color)', margin: 0 }} />

          {/* Pricing Section */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '10px' }}>
              {hasDiscount ? (
                <>
                  <span style={{ fontSize: '2rem', fontWeight: '800', color: 'var(--text-primary)' }}>₹{discountPrice.toFixed(2)}</span>
                  <span style={{ fontSize: '1.2rem', textDecoration: 'line-through', color: 'var(--text-muted)' }}>₹{originalPrice.toFixed(2)}</span>
                  <span style={{ fontSize: '1.1rem', fontWeight: 'bold', color: 'var(--brand-purple)' }}>({product.discount_percent}% off)</span>
                </>
              ) : (
                <span style={{ fontSize: '2rem', fontWeight: '800', color: 'var(--text-primary)' }}>₹{originalPrice.toFixed(2)}</span>
              )}
            </div>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Inclusive of all taxes</span>
          </div>

          <hr style={{ border: 'none', borderTop: '1px solid var(--border-color)', margin: 0 }} />

          {/* Color Swatch Selection */}
          {product.colors && product.colors.length > 0 && (
            <div>
              <h4 style={{ fontSize: '0.85rem', fontWeight: 'bold', textTransform: 'uppercase', marginBottom: '8px', color: 'var(--text-primary)' }}>Select Color: <span style={{ fontWeight: 'normal', textTransform: 'none', color: 'var(--text-secondary)' }}>{selectedColor}</span></h4>
              <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                {product.colors.map((color) => (
                  <button
                    key={color}
                    onClick={() => setSelectedColor(color)}
                    style={{
                      width: '34px',
                      height: '34px',
                      borderRadius: '50%',
                      border: '2px solid #fff',
                      backgroundColor: color,
                      cursor: 'pointer',
                      outline: 'none',
                      boxShadow: selectedColor === color ? '0 0 0 2.5px var(--brand-purple)' : '0 0 0 1px var(--border-color)',
                      transition: 'all 0.2s',
                    }}
                    title={color}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Size Selection */}
          {product.sizes && product.sizes.length > 0 && (
            <div>
              <h4 style={{ fontSize: '0.85rem', fontWeight: 'bold', textTransform: 'uppercase', marginBottom: '8px', color: 'var(--text-primary)' }}>Select Size:</h4>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {product.sizes.map((size) => (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    style={{
                      padding: '8px 16px',
                      border: '2px solid',
                      borderColor: selectedSize === size ? 'var(--brand-purple)' : 'var(--border-color)',
                      borderRadius: '8px',
                      fontSize: '0.85rem',
                      fontWeight: 'bold',
                      cursor: 'pointer',
                      color: selectedSize === size ? 'var(--brand-purple)' : 'var(--text-secondary)',
                      background: selectedSize === size ? 'var(--brand-teal-lt)' : 'var(--bg-card)',
                      transition: 'all 0.2s',
                    }}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Embroidery option */}
          <div style={{ border: '1px solid var(--border-color)', padding: '12px 16px', borderRadius: '12px', background: 'var(--bg-secondary)', marginTop: '8px' }}>
            <label style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.875rem', fontWeight: 'bold', color: 'var(--text-primary)', cursor: 'pointer' }}>
              <span>ADD CUSTOM EMBROIDERY (+ ₹150)</span>
              <input
                type="checkbox"
                checked={wantsEmbroidery}
                onChange={(e) => setWantsEmbroidery(e.target.checked)}
                style={{ width: '18px', height: '18px', cursor: 'pointer' }}
              />
            </label>
          </div>

          <div>
            <h4 style={{ fontSize: '0.85rem', fontWeight: 'bold', textTransform: 'uppercase', marginBottom: '6px', color: 'var(--text-primary)' }}>About this item:</h4>
            <p style={{ fontSize: '0.95rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>{product.description}</p>
          </div>

          <div style={{ display: 'flex', gap: '15px', color: 'var(--text-muted)', fontSize: '0.8rem', marginTop: '8px' }}>
            <span>🔄 7-Day Easy Returns</span>
            <span>🛡️ 100% Quality Guaranteed</span>
          </div>
        </div>

        {/* Column 3: Amazon-style Buy Box Card */}
        <div className="product-detail-buybox-column">
          <div className="buy-box-card" style={{ border: '1px solid var(--border-color)', borderRadius: '16px', padding: '1.5rem', background: 'var(--glossy-bg)', boxShadow: 'var(--shadow-md)', position: 'sticky', top: '100px' }}>
            <div style={{ fontSize: '1.5rem', fontWeight: '800', color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
              ₹{totalPrice.toFixed(2)}
            </div>

            <div style={{ margin: '12px 0' }}>
              {product.stock > 0 ? (
                <div>
                  <span style={{ color: '#10b981', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ display: 'inline-block', width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#10b981' }}></span>
                    In Stock
                  </span>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', marginTop: '4px' }}>
                    Usually dispatches within 24 hours.
                  </span>
                </div>
              ) : (
                <span style={{ color: 'var(--color-cancelled)', fontWeight: 'bold' }}>Temporarily Out of Stock</span>
              )}
            </div>

            {product.stock > 0 && (
              <>
                {/* Quantity selector */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '6px 12px', background: 'var(--bg-card)' }}>
                  <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Quantity:</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <button onClick={() => handleQtyChange(-1)} style={{ background: 'none', border: 'none', fontSize: '1.2rem', cursor: 'pointer', color: 'var(--text-primary)', fontWeight: 'bold' }}>−</button>
                    <span style={{ fontSize: '0.95rem', fontWeight: 'bold', minWidth: '20px', textAlign: 'center' }}>{quantity}</span>
                    <button onClick={() => handleQtyChange(1)} style={{ background: 'none', border: 'none', fontSize: '1.2rem', cursor: 'pointer', color: 'var(--text-primary)', fontWeight: 'bold' }}>+</button>
                  </div>
                </div>

                {/* Add to Cart Button */}
                <button
                  onClick={handleAddToCart}
                  className="btn btn-teal w-full"
                  style={{ borderRadius: '50px', marginBottom: '0.75rem', padding: '0.85rem' }}
                >
                  Add to Cart
                </button>

                {/* Buy Now Button */}
                <button
                  onClick={handleBuyNow}
                  className="btn btn-primary w-full"
                  style={{ borderRadius: '50px', padding: '0.85rem', background: 'var(--brand-navy)' }}
                >
                  Buy Now
                </button>
              </>
            )}

            <div style={{ borderTop: '1px solid var(--border-color)', marginTop: '1.5rem', paddingTop: '1rem', fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div>💳 Secure transaction</div>
              <div>🚚 Ships from and sold by WhiskWear</div>
              
              {/* Wishlist toggle */}
              {user && (
                <button 
                  onClick={() => toggleWishlist(product)}
                  style={{ background: 'none', border: 'none', display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 600, color: 'var(--brand-purple)', padding: '4px 0', marginTop: '8px' }}
                >
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill={isWishlisted ? 'var(--brand-purple)' : 'none'}
                    stroke="var(--brand-purple)"
                    strokeWidth="2.5"
                  >
                    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                  </svg>
                  {isWishlisted ? 'Remove from Wishlist' : 'Add to Wishlist'}
                </button>
              )}
            </div>
          </div>
        </div>

      </div>

      {/* Suggested / Related Products section */}
      {relatedProducts.length > 0 && (
        <div style={{ marginTop: '4rem', borderTop: '1px solid var(--border-color)', paddingTop: '3rem' }}>
          <h2 style={{ fontSize: '1.75rem', fontWeight: '800', color: 'var(--text-primary)', marginBottom: '1.5rem', fontFamily: 'var(--font-serif)' }}>Related Products</h2>
          <div className="product-grid">
            {relatedProducts.map((p, idx) => {
              const op = parseFloat(p.price);
              const disc = p.discount_percent > 0;
              const dp = disc ? op * (1 - p.discount_percent / 100) : op;
              
              return (
                <ScrollReveal key={p.id} delay={idx * 100} threshold={0.05}>
                  <div className="product-card" onClick={() => navigate(`/product/${p.id}`)} style={{ cursor: 'pointer' }}>
                    <div className="product-img-wrapper">
                      <ImageWithSkeleton src={getImageUrl(p.image_urls && p.image_urls[0] ? p.image_urls[0] : p.image_url)} alt={p.name} className="product-img" style={{ position: 'absolute', inset: 0 }} />
                      {disc && <div className="discount-badge">{p.discount_percent}% OFF</div>}
                    </div>
                    <div className="product-info">
                      <h3 className="product-name">{p.name}</h3>
                      <div style={{ display: 'flex', gap: '8px', alignItems: 'baseline', marginTop: 'auto' }}>
                        <span style={{ fontWeight: 'bold', color: 'var(--text-primary)' }}>₹{dp.toFixed(2)}</span>
                        {disc && <span style={{ fontSize: '0.8rem', textDecoration: 'line-through', color: 'var(--text-muted)' }}>₹{op.toFixed(2)}</span>}
                      </div>
                    </div>
                  </div>
                </ScrollReveal>
              );
            })}
          </div>
        </div>
      )}

      {/* Reviews & Ratings Section */}
      <div id="reviews-section">
        <ReviewSection productId={product.id} user={user} />
      </div>

    </div>
  );
}
