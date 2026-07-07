import React, { useState, useEffect } from 'react';
import { apiService } from '../api';

const ReviewSection = ({ productId, user }) => {
  const [reviews, setReviews] = useState([]);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [hoverRating, setHoverRating] = useState(0);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState('');

  useEffect(() => {
    fetchReviews();
  }, [productId]);

  const fetchReviews = async () => {
    try {
      const res = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:5000/api'}/reviews/${productId}`);
      const data = await res.json();
      if (res.ok) setReviews(data);
    } catch (err) {
      console.error('Error fetching reviews:', err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      setMsg('Please sign in to leave a review.');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:5000/api'}/reviews`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          product_id: productId,
          user_name: user.name,
          rating,
          comment
        })
      });
      const data = await res.json();
      if (res.ok) {
        setReviews([data, ...reviews]);
        setComment('');
        setRating(5);
        setMsg('Review submitted successfully!');
      } else {
        setMsg(data.error || 'Failed to submit review.');
      }
    } catch (err) {
      setMsg('Error submitting review.');
    }
    setLoading(false);
  };

  const averageRating = reviews.length > 0 
    ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1)
    : 0;

  return (
    <div className="review-section" style={{ marginTop: '3rem', borderTop: '1px solid rgba(0,0,0,0.1)', paddingTop: '2rem' }}>
      <h3 style={{ fontSize: '1.5rem', marginBottom: '1rem', color: 'var(--brand-purple)' }}>Customer Reviews</h3>
      
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
        <div style={{ fontSize: '2.5rem', fontWeight: '800' }}>{averageRating}</div>
        <div>
          <div style={{ color: '#FFD700', fontSize: '1.2rem' }}>
            {'★'.repeat(Math.round(averageRating)) + '☆'.repeat(5 - Math.round(averageRating))}
          </div>
          <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Based on {reviews.length} reviews</div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '2rem' }}>
        <div>
          <h4 style={{ marginBottom: '1rem' }}>Write a Review</h4>
          {!user ? (
            <p style={{ color: 'var(--text-secondary)' }}>You must be signed in to leave a review.</p>
          ) : (
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', background: 'var(--bg-secondary)', padding: '1.5rem', borderRadius: '12px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Rating</label>
                <div style={{ display: 'flex', gap: '0.2rem', cursor: 'pointer' }}>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <span
                      key={star}
                      onClick={() => setRating(star)}
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(0)}
                      style={{ fontSize: '1.8rem', color: star <= (hoverRating || rating) ? '#FFD700' : '#ddd' }}
                    >
                      ★
                    </span>
                  ))}
                </div>
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Review</label>
                <textarea
                  className="input-field"
                  rows="4"
                  placeholder="Share your experience with this product..."
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  style={{ width: '100%', resize: 'vertical' }}
                  required
                />
              </div>
              <button type="submit" className="btn btn-primary" disabled={loading}>
                {loading ? 'Submitting...' : 'Submit Review'}
              </button>
              {msg && <div style={{ marginTop: '0.5rem', color: msg.includes('success') ? 'green' : 'red' }}>{msg}</div>}
            </form>
          )}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <h4 style={{ marginBottom: '0.5rem' }}>Recent Reviews</h4>
          {reviews.length === 0 ? (
            <p style={{ color: 'var(--text-secondary)' }}>No reviews yet. Be the first!</p>
          ) : (
            reviews.map((r) => (
              <div key={r.id} style={{ padding: '1.5rem', borderRadius: '12px', background: 'var(--bg-secondary)', border: '1px solid rgba(0,0,0,0.05)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                  <div style={{ fontWeight: 'bold' }}>{r.user_name || 'Anonymous'}</div>
                  <div style={{ color: '#FFD700' }}>{'★'.repeat(r.rating) + '☆'.repeat(5 - r.rating)}</div>
                </div>
                <div style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', marginBottom: '1rem' }}>
                  {new Date(r.created_at).toLocaleDateString()}
                </div>
                <p style={{ margin: 0, lineHeight: 1.5 }}>{r.comment}</p>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default ReviewSection;
