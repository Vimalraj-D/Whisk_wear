import React from 'react';
import { useNavigate } from 'react-router-dom';
import { getImageUrl } from '../api';

export default function WishlistModal({ isOpen, onClose, wishlist = [], toggleWishlist, addToCart }) {
  const navigate = useNavigate();

  if (!isOpen) return null;

  return (
    <div className="wishlist-modal-overlay" onClick={onClose}>
      <div className="wishlist-modal-dropdown" onClick={(e) => e.stopPropagation()}>
        <div className="wishlist-modal-header">
          <h3>My Wishlist ({wishlist.length})</h3>
          <button className="wishlist-modal-close" onClick={onClose}>×</button>
        </div>
        <div className="wishlist-modal-items">
          {wishlist.length === 0 ? (
            <div className="wishlist-modal-empty">Your wishlist is empty.</div>
          ) : (
            wishlist.map(item => (
              <div key={item.id} className="wishlist-modal-item">
                <img
                  src={getImageUrl(item.image_urls && item.image_urls[0] ? item.image_urls[0] : item.image_url)}
                  alt={item.name}
                  className="wishlist-modal-item-img"
                  onClick={() => { navigate(`/product/${item.id}`); onClose(); }}
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = 'https://images.unsplash.com/photo-1590794056226-79ef3a814c2c?w=100';
                  }}
                />
                <div className="wishlist-modal-item-info">
                  <h4 className="wishlist-modal-item-name" onClick={() => { navigate(`/product/${item.id}`); onClose(); }}>
                    {item.name}
                  </h4>
                  <span className="wishlist-modal-item-price">₹{parseFloat(item.price).toFixed(2)}</span>
                  <div className="wishlist-modal-item-actions">
                    <button
                      className="wishlist-modal-add-btn"
                      onClick={() => {
                        addToCart({
                          ...item,
                          price: item.discount_percent > 0 ? parseFloat(item.price) * (1 - item.discount_percent / 100) : parseFloat(item.price)
                        });
                        onClose();
                      }}
                    >
                      Add to Bag
                    </button>
                    <button
                      className="wishlist-modal-remove-btn"
                      onClick={() => toggleWishlist(item)}
                    >
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
