import React, { useState, useEffect } from 'react';
import { apiService } from '../api';

export default function ProductModal({ isOpen, onClose, onSave, initialData = null, adminToken }) {
  const [form, setForm] = useState({
    name: '',
    description: '',
    price: '',
    category: 'kitchen_cloths',
    image_url: '',
    stock: ''
  });

  useEffect(() => {
    if (initialData) {
      setForm({
        name: initialData.name || '',
        description: initialData.description || '',
        price: initialData.price?.toString() || '',
        category: initialData.category || 'kitchen_cloths',
        image_url: initialData.image_url || '',
        stock: initialData.stock?.toString() || ''
      });
    } else {
      setForm({ name: '', description: '', price: '', category: 'kitchen_cloths', image_url: '', stock: '' });
    }
  }, [initialData]);

  const handleChange = e => {
    const { name, value } = e.target;
    setForm(p => ({ ...p, [name]: value }));
  };

  const handleSubmit = async e => {
    e.preventDefault();
    const payload = {
      ...form,
      price: parseFloat(form.price),
      stock: parseInt(form.stock) || 0
    };
    try {
      if (initialData) {
        await apiService.updateProduct(initialData.id, payload, adminToken);
      } else {
        await apiService.createProduct(payload, adminToken);
      }
      onSave();
      onClose();
    } catch (err) {
      console.error('Product save error', err);
      // Optionally surface error to UI
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h3>{initialData ? 'Edit Product' : 'Add New Product'}</h3>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>
        <form onSubmit={handleSubmit} className="checkout-form">
          <div className="form-group">
            <label className="form-label">Product Name</label>
            <input type="text" name="name" className="form-control" value={form.name} onChange={handleChange} required />
          </div>
          <div className="form-group">
            <label className="form-label">Category</label>
            <select name="category" className="form-control" value={form.category} onChange={handleChange} required>
              <option value="kitchen_cloths">Kitchen Cloths</option>
              <option value="kids_wear">Kids Wear</option>
            </select>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.85rem' }}>
            <div className="form-group">
              <label className="form-label">Price (₹)</label>
              <input type="number" step="0.01" name="price" className="form-control" value={form.price} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label className="form-label">Stock (Units)</label>
              <input type="number" name="stock" className="form-control" value={form.stock} onChange={handleChange} required />
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Image URL</label>
            <input type="url" name="image_url" className="form-control" placeholder="https://…" value={form.image_url} onChange={handleChange} />
          </div>
          <div className="form-group">
            <label className="form-label">Description</label>
            <textarea name="description" className="form-control" rows={3} value={form.description} onChange={handleChange} />
          </div>
          <div className="modal-actions" style={{ marginTop: '1rem', display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary">Save Product</button>
          </div>
        </form>
      </div>
    </div>
  );
}
