import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiService } from '../api';

export default function CategoryTicker() {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    apiService.getCategories()
      .then(res => {
        const cats = res.data || res;
        setCategories(cats);
      })
      .catch(() => {});
  }, []);

  const offers = [
    { type: 'offer', text: '⚡ Special Offer: Buy 2 Get 1 Free on all Kitchen Cloths!' },
    { type: 'offer', text: '🏷️ Limited Time: 20% OFF on Kids Summer Collection!' },
    { type: 'offer', text: '🚚 Enjoy Free Shipping on orders above ₹499!' },
    { type: 'offer', text: '⭐ Premium Quality, Crafted for Everyday Comfort!' }
  ];

  // Map categories to list items with links
  const categoryItems = categories.map(cat => ({
    type: 'category',
    text: cat.name,
    key: cat.name.toLowerCase().replace(/[^a-z0-9]+/g, '_')
  }));

  // Combine categories and offers, alternating them
  const tickerItems = [];
  const maxLength = Math.max(categoryItems.length, offers.length);
  for (let i = 0; i < maxLength; i++) {
    if (categoryItems[i]) tickerItems.push(categoryItems[i]);
    if (offers[i]) tickerItems.push(offers[i]);
  }

  // Duplicate items to ensure a seamless infinite scrolling loop
  const duplicatedItems = [...tickerItems, ...tickerItems, ...tickerItems];

  const handleCategoryClick = (key) => {
    navigate(`/shop?category=${key}`);
  };

  if (tickerItems.length === 0) return null;

  return (
    <div className="category-ticker-container">
      <div className="category-ticker-wrap">
        <div className="category-ticker-move">
          {duplicatedItems.map((item, index) => (
            <div key={index} className="ticker-item-wrapper">
              {item.type === 'category' ? (
                <button
                  onClick={() => handleCategoryClick(item.key)}
                  className="ticker-category-link"
                >
                  {item.text}
                </button>
              ) : (
                <span className="ticker-offer-text">{item.text}</span>
              )}
              <span className="ticker-separator">✦</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
