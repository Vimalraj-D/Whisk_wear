import React, { useState, useEffect, useCallback } from 'react';
import { apiService } from '../../api';

export default function ReviewsPage({ adminToken, showToast }) {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchReviews = useCallback(async () => {
    try {
      const res = await fetch(`${process.env.REACT_APP_API_URL || 'https://whisk-wear.onrender.com/api'}/reviews/admin/all`, {
        headers: { Authorization: `Bearer ${adminToken}` }
      });
      const data = await res.json();
      if (res.ok) setReviews(data);
    } catch (err) {
      showToast('Error loading reviews');
    }
    setLoading(false);
  }, [adminToken, showToast]);

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this review?')) return;
    try {
      const res = await fetch(`${process.env.REACT_APP_API_URL || 'https://whisk-wear.onrender.com/api'}/reviews/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${adminToken}` }
      });
      if (res.ok) {
        showToast('Review deleted');
        fetchReviews();
      } else {
        showToast('Failed to delete review');
      }
    } catch (err) {
      showToast('Error deleting review');
    }
  };

  const handleEditRating = async (id, currentRating) => {
    const newRating = window.prompt('Enter new rating (1-5):', currentRating);
    if (!newRating) return;
    const rating = parseInt(newRating);
    if (isNaN(rating) || rating < 1 || rating > 5) {
      showToast('Invalid rating. Must be 1-5.');
      return;
    }
    try {
      const res = await fetch(`${process.env.REACT_APP_API_URL || 'https://whisk-wear.onrender.com/api'}/reviews/${id}`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${adminToken}` 
        },
        body: JSON.stringify({ rating })
      });
      if (res.ok) {
        showToast('Rating updated');
        fetchReviews();
      } else {
        showToast('Failed to update rating');
      }
    } catch (err) {
      showToast('Error updating rating');
    }
  };

  if (loading) return <div>Loading reviews...</div>;

  return (
    <div className="table-responsive">
      {reviews.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)' }}>No reviews found.</div>
      ) : (
        <table className="admin-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Product</th>
              <th>User</th>
              <th>Rating</th>
              <th>Comment</th>
              <th>Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {reviews.map(r => (
              <tr key={r.id}>
                <td>#{r.id}</td>
                <td>{r.products?.name || `Product #${r.product_id}`}</td>
                <td>{r.user_name || 'Anonymous'}</td>
                <td style={{ color: '#FFD700', fontSize: '1.2rem', whiteSpace: 'nowrap' }}>
                  {'★'.repeat(r.rating)}{'☆'.repeat(5 - r.rating)}
                </td>
                <td style={{ maxWidth: '300px', whiteSpace: 'normal' }}>{r.comment}</td>
                <td>{new Date(r.created_at).toLocaleDateString()}</td>
                <td>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button className="btn btn-sm btn-outline-teal" onClick={() => handleEditRating(r.id, r.rating)}>Edit Rating</button>
                    <button className="btn btn-sm" style={{ borderColor: 'var(--color-cancelled)', color: 'var(--color-cancelled)' }} onClick={() => handleDelete(r.id)}>Delete</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
