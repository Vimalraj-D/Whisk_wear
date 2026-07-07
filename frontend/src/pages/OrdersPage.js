import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { apiService } from '../api';

export default function OrdersPage({ userToken, showToast, onSessionExpired }) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiService.getMyOrders(userToken)
      .then(setOrders)
      .catch(err => {
        showToast('Failed to load orders');
        if ([401, 403].includes(err.response?.status)) onSessionExpired();
      })
      .finally(() => setLoading(false));
  }, [userToken, showToast, onSessionExpired]);

  return (
    <div>
      <div className="page-header">
        <h2>My Orders</h2>
        <p>Track your purchases and delivery status in one place.</p>
      </div>

      <div className="admin-layout" style={{ maxWidth: '1100px', margin: '0 auto', padding: '0 1.5rem' }}>
        {loading ? (
          <div className="loading-screen"><div className="spinner" /><span>Loading orders…</span></div>
        ) : orders.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-secondary)' }}>
            <div style={{ fontSize: '3.5rem', marginBottom: '1rem' }}>📦</div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '0.5rem' }}>No orders yet</h3>
            <p>Start shopping to see your orders here.</p>
            <Link to="/" className="btn btn-primary" style={{ marginTop: '1.5rem', display: 'inline-flex' }}>Browse Collection</Link>
          </div>
        ) : (
          <div className="table-responsive" style={{ animation: 'fadeUp 0.4s ease' }}>
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Order</th>
                  <th>Date</th>
                  <th>Items</th>
                  <th>Total</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {orders.map(order => (
                  <tr key={order.id}>
                    <td><strong>#{order.id}</strong></td>
                    <td>{new Date(order.created_at).toLocaleDateString(undefined, { dateStyle: 'medium' })}</td>
                    <td>
                      {order.order_items?.map(item => (
                        <div key={item.id} style={{ fontSize: '0.82rem', marginBottom: '0.15rem' }}>
                          · {item.products?.name || 'Item'} <span style={{ color: 'var(--text-muted)' }}>×{item.quantity}</span>
                        </div>
                      ))}
                    </td>
                    <td><strong>₹{parseFloat(order.total_amount).toFixed(2)}</strong></td>
                    <td><span className={`status-badge status-${order.status}`}>{order.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
