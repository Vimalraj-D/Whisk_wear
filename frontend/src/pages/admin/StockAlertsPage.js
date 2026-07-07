import React, { useEffect, useState } from 'react';
import { apiService } from '../../api';
import './StockAlertsPage.css';

const StockAlertsPage = () => {
  const [lowStockProducts, setLowStockProducts] = useState([]);
  const token = localStorage.getItem('whiskwear_admin_token');

  const fetchLowStock = async () => {
    try {
      const products = await apiService.getProducts();
      const low = products.filter(p => p.stock <= 5);
      setLowStockProducts(low);
    } catch (err) {
      console.error('Failed to load low stock products', err);
    }
  };

  useEffect(() => {
    fetchLowStock();
  }, []);

  const handleRestock = async (id) => {
    const additional = prompt('Enter quantity to add:', '10');
    if (!additional) return;
    const product = lowStockProducts.find(p => p.id === id);
    const newStock = (product.stock || 0) + parseInt(additional, 10);
    try {
      await apiService.updateProduct(id, { stock: newStock }, token);
      fetchLowStock();
    } catch (err) {
      console.error('Restock failed', err);
    }
  };

  return (
    <div className="admin-stock-alerts">
      <h2 className="section-title">Low Stock Alerts</h2>
      {lowStockProducts.length === 0 ? (
        <p className="no-alerts">All products have sufficient stock.</p>
      ) : (
        <table className="stock-table">
          <thead>
            <tr>
              <th>Product</th>
              <th>Current Stock</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {lowStockProducts.map(p => (
              <tr key={p.id}>
                <td>{p.name}</td>
                <td>{p.stock}</td>
                <td>
                  <button className="btn btn-warning btn-sm" onClick={() => handleRestock(p.id)}>
                    Restock
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default StockAlertsPage;
