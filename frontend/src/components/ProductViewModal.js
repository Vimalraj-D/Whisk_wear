import React, { useState } from 'react';
import { getImageUrl } from '../api';

export default function ProductViewModal({ product, onClose }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const images = product.image_urls || [];

  const prev = () => setCurrentIndex((i) => (i === 0 ? images.length - 1 : i - 1));
  const next = () => setCurrentIndex((i) => (i === images.length - 1 ? 0 : i + 1));

  return (
    <div className="modal-overlay" style={overlayStyle}>
      <div className="modal-content" style={contentStyle}>
        <div className="modal-header" style={headerStyle}>
          <h3>{product.name}</h3>
          <button className="close-btn" onClick={onClose} style={closeBtnStyle}>×</button>
        </div>
        <div className="modal-body" style={bodyStyle}>
          {images.length > 0 && (
            <div style={imageContainerStyle}>
              <img src={getImageUrl(images[currentIndex])} alt={`${product.name} ${currentIndex + 1}`} style={imageStyle} />
              {images.length > 1 && (
                <div style={carouselControlsStyle}>
                  <button onClick={prev} style={arrowBtnStyle}>←</button>
                  <button onClick={next} style={arrowBtnStyle}>→</button>
                </div>
              )}
            </div>
          )}
          <p><strong>Category:</strong> {product.category}</p>
          <p><strong>Price:</strong> ₹{parseFloat(product.price).toFixed(2)}</p>
          <p><strong>Stock:</strong> {product.stock}</p>
          <p><strong>Description:</strong></p>
          <p>{product.description}</p>
        </div>
        <div className="modal-actions" style={actionsStyle}>
          <button onClick={onClose} className="btn btn-secondary">Close</button>
        </div>
      </div>
    </div>
  );
}

// Simple inline styles for a glassmorphism look
const overlayStyle = {
  position: 'fixed',
  inset: 0,
  backgroundColor: 'rgba(0,0,0,0.4)',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  zIndex: 1000,
};

const contentStyle = {
  background: 'rgba(255,255,255,0.85)',
  backdropFilter: 'blur(12px)',
  borderRadius: '12px',
  maxWidth: '500px',
  width: '90%',
  padding: '1rem',
  boxShadow: '0 8px 32px 0 rgba(31,38,135,0.37)',
};

const headerStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: '0.5rem',
};

const closeBtnStyle = {
  background: 'transparent',
  border: 'none',
  fontSize: '1.5rem',
  cursor: 'pointer',
};

const bodyStyle = { marginBottom: '1rem' };

const imageContainerStyle = { textAlign: 'center', marginBottom: '1rem' };
const imageStyle = { maxWidth: '100%', maxHeight: '200px', borderRadius: '8px' };
const carouselControlsStyle = { marginTop: '0.5rem' };
const arrowBtnStyle = { margin: '0 0.5rem', cursor: 'pointer' };
const actionsStyle = { textAlign: 'right' };
