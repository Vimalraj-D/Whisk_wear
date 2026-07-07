import React, { useEffect, useState } from 'react';
import { apiService } from '../../api';
import './AnalyticsPage.css';

const AnalyticsPage = () => {
  const [revenueStats, setRevenueStats] = useState(null);
  const [orderStats, setOrderStats] = useState({});
  const [topProducts, setTopProducts] = useState([]);
  const token = localStorage.getItem('whiskwear_admin_token');

  const fetchAnalytics = async () => {
    try {
      const rev = await apiService.getRevenueStats(token);
      setRevenueStats(rev.data || rev);
      const orders = await apiService.getOrderStats(token);
      setOrderStats(orders.data || orders);
      const top = await apiService.getTopProducts(token);
      setTopProducts(top.data || top);
    } catch (err) {
      console.error('Failed to load analytics', err);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  return (
    <div className="admin-analytics">
      <h2 className="section-title">Analytics Dashboard</h2>
      <div className="analytics-section">
        <h3>Revenue</h3>
        {revenueStats ? (
          <p>Total Revenue: <strong>₹{parseFloat(revenueStats.totalRevenue).toFixed(2)}</strong></p>
        ) : (
          <p>Loading...</p>
        )}
      </div>

      <div className="analytics-section">
        <h3>Orders per Day (Last 30 days)</h3>
        {Object.keys(orderStats).length > 0 ? (
          <table className="analytics-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Orders</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(orderStats).map(([date, count]) => (
                <tr key={date}>
                  <td>{date}</td>
                  <td>{count}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p>Loading...</p>
        )}
      </div>

      <div className="analytics-section">
        <h3>Top Selling Products</h3>
        {topProducts.length > 0 ? (
          <table className="analytics-table">
            <thead>
              <tr>
                <th>Product ID</th>
                <th>Quantity Sold</th>
              </tr>
            </thead>
            <tbody>
              {topProducts.map((p) => (
                <tr key={p.product_id || p.id}>
                  <td>{p.product_id || p.id}</td>
                  <td>{p.quantity}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p>Loading...</p>
        )}
      </div>
    </div>
  );
};

export default AnalyticsPage;
