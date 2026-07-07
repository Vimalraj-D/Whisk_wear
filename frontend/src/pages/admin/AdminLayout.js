import React, { useState, useEffect, useCallback } from 'react';
import ProductViewModal from '../../components/ProductViewModal';
import { useNavigate } from 'react-router-dom';
import { apiService, getImageUrl } from '../../api';
import CategoriesPage from './CategoriesPage';
import StockAlertsPage from './StockAlertsPage';
import AnalyticsPage from './AnalyticsPage';

export default function AdminLayout({ adminToken, showToast, onSessionExpired }) {
  const navigate = useNavigate();
  const [tab, setTab] = useState('Dashboard');
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  
  // Product Form Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [viewProduct, setViewProduct] = useState(null);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [productForm, setProductForm] = useState({ name: '', description: '', price: '', category: 'kitchen_cloths', category_id: '', subcategory_id: '', stock: '', is_featured: false, discount_percent: 0, sizes: '', colors: '' });
  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [existingImages, setExistingImages] = useState([]);



  const load = useCallback(async () => {
    try {
      const [o, p, cats, subs] = await Promise.all([
        apiService.getOrders(adminToken),
        apiService.getProducts(),
        apiService.getCategories(),
        apiService.getSubcategories()
      ]);
      setOrders(o); 
      setProducts(p);
      setCategories(cats.data || cats);
      setSubcategories(subs.data || subs);
    } catch (err) {
      showToast('Session error: ' + (err.response?.data?.error || err.message));
      if ([401, 403].includes(err.response?.status)) onSessionExpired();
    }
  }, [adminToken, showToast, onSessionExpired]);

  useEffect(() => { load(); }, [load]);

  const handleStatusUpdate = async (id, status) => {
    try { await apiService.updateOrderStatus(id, status, adminToken); showToast(`Order #${id} → ${status}`); load(); }
    catch (err) { showToast('Update failed'); }
  };
  const handleDelete = async (id) => {
    if (!window.confirm('Delete this product?')) return;
    try { await apiService.deleteProduct(id, adminToken); showToast('Product deleted'); load(); }
    catch (err) { showToast('Delete failed'); }
  };
  const handleFormSubmit = async (e) => {
    e.preventDefault();
    const totalImages = existingImages.length + selectedFiles.length;
    if (totalImages === 0) {
      showToast('Please upload or keep at least 1 image');
      return;
    }
    if (totalImages > 10) {
      showToast('A product can have a maximum of 10 images');
      return;
    }
    const payload = { 
      ...productForm, 
      price: parseFloat(productForm.price), 
      stock: parseInt(productForm.stock) || 0,
      category_id: productForm.category_id ? parseInt(productForm.category_id) : null,
      subcategory_id: productForm.subcategory_id ? parseInt(productForm.subcategory_id) : null,
      is_featured: productForm.is_featured === true || productForm.is_featured === 'true',
      discount_percent: parseInt(productForm.discount_percent) || 0,
      sizes: productForm.sizes,
      colors: productForm.colors,
      image_urls: existingImages.join(',')
    };
    try {
      if (editingProduct) {
        await apiService.updateProductWithImages(editingProduct.id, payload, selectedFiles, adminToken);
        showToast('Product updated');
      } else {
        await apiService.createProductWithImages(payload, selectedFiles, adminToken);
        showToast('Product created');
      }
      setIsModalOpen(false);
      setEditingProduct(null);
      setSelectedFiles([]);
      setExistingImages([]);
      load();
    } catch (err) {
      showToast('Save failed: ' + (err.response?.data?.error || err.message));
    }
  };

  const openAdd = () => {
    setEditingProduct(null);
    const catId = getCategoryIdFromKey('kitchen_cloths');
    setProductForm({ name: '', description: '', price: '', category: 'kitchen_cloths', category_id: catId ? catId.toString() : '', subcategory_id: '', stock: '', is_featured: false, discount_percent: 0, sizes: '', colors: '' });
    setSelectedFiles([]);
    setExistingImages([]);
    setIsModalOpen(true);
  };
  const openEdit = (p) => {
    setEditingProduct(p);
    setProductForm({ 
      name: p.name, 
      description: p.description || '', 
      price: p.price.toString(), 
      category: p.category, 
      category_id: p.category_id ? p.category_id.toString() : '',
      subcategory_id: p.subcategory_id ? p.subcategory_id.toString() : '',
      stock: p.stock.toString(),
      is_featured: p.is_featured || false,
      discount_percent: p.discount_percent || 0,
      sizes: p.sizes ? p.sizes.join(', ') : '',
      colors: p.colors ? p.colors.join(', ') : ''
    });
    setSelectedFiles([]);
    setExistingImages(p.image_urls || []);
    setIsModalOpen(true);
  };

  const getCategoryIdFromKey = (key) => {
    const match = categories.find(c => {
      const normalized = c.name.toLowerCase().replace(/[^a-z0-9]/g, '_');
      return normalized === key || normalized.replace('__', '_') === key;
    });
    return match ? match.id : null;
  };

  const revenue = orders.filter(o => o.status !== 'cancelled').reduce((s, o) => s + parseFloat(o.total_amount), 0);
  const pending = orders.filter(o => o.status === 'pending').length;
  const lowStock = products.filter(p => p.stock <= 5).length;

  const sidebarMenu = [
    { name: 'Dashboard', icon: <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg> },
    { name: 'Products', icon: <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="16.5" y1="9.4" x2="7.5" y2="4.21"></line><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path><polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline><line x1="12" y1="22.08" x2="12" y2="12"></line></svg> },
    { name: 'Categories', icon: <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"></path><line x1="7" y1="7" x2="7.01" y2="7"></line></svg> },
    { name: 'Orders', icon: <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path><line x1="3" y1="6" x2="21" y2="6"></line><path d="M16 10a4 4 0 0 1-8 0"></path></svg> },
    { name: 'Stock Alerts', icon: <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg> },
    { name: 'Analytics', icon: <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10"></line><line x1="12" y1="20" x2="12" y2="4"></line><line x1="6" y1="20" x2="6" y2="14"></line></svg> }
  ];

  return (
    <div className="admin-page-container">
      {/* Sidebar */}
      <aside className="admin-sidebar">
        <div className="logo-container" onClick={() => navigate('/')} style={{ padding: '2rem 1rem', display: 'flex', alignItems: 'center', cursor: 'pointer', gap: '10px' }}>
          <img src="https://aoppjuuqdgajcidduqld.supabase.co/storage/v1/object/public/Images/favicon.png" alt="WhiskWear" className="logo-img" style={{ width: '40px', height: '40px' }} />
          <span className="logo-wordmark" style={{ fontSize: '1.4rem' }}>WHISK<span style={{ color: 'var(--brand-teal)' }}>WEAR</span></span>
        </div>
        <nav className="admin-sidebar-nav">
          {sidebarMenu.map(m => (
            <button 
              key={m.name} 
              className={`admin-nav-item ${tab === m.name ? 'active' : ''}`}
              onClick={() => setTab(m.name)}
            >
              <span className="admin-nav-icon">{m.icon}</span>
              {m.name}
            </button>
          ))}
        </nav>

        <div className="admin-sidebar-header" style={{ marginTop: '2rem' }}>
          Shortcuts
        </div>
        <nav className="admin-sidebar-nav">
          <button className="admin-nav-item" onClick={() => navigate('/')}>
            <span className="admin-nav-icon">🏠</span>
            Back to Store
          </button>
        </nav>
      </aside>

      {/* Main Content Area */}
      <main className="admin-main-content">
        {/* Top bar */}
        <header className="admin-topbar">
          <div className="admin-breadcrumb">
            <span style={{ color: 'var(--brand-purple)', fontWeight: '700' }}>W&W Admin</span> <span style={{ color: 'var(--text-muted)' }}>/ {tab}</span>
          </div>
          <div className="admin-user-info">
            <span>👤 admin@whiskwear.com</span>
            <button className="btn btn-sm btn-outline-teal" onClick={() => { onSessionExpired(); navigate('/'); }}>
              Sign out
            </button>
          </div>
        </header>

        <div className="admin-content-inner">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
            <div>
              <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.25rem' }}>{tab}</h2>
              <p style={{ color: 'var(--text-secondary)' }}>
                {tab === 'Dashboard' && 'Overview of your store performance.'}
                {tab === 'Products' && `${products.length} products total`}
                {tab === 'Categories' && 'Manage your store categories.'}
                {tab === 'Orders' && `${orders.length} orders total`}
                {tab === 'Stock Alerts' && `${lowStock} items low on stock`}
                {tab === 'Analytics' && 'View detailed store analytics.'}
              </p>
            </div>
            
            {tab === 'Products' && (
              <button className="btn btn-primary" onClick={openAdd} style={{ background: 'var(--brand-purple)', borderColor: 'var(--brand-purple)' }}>+ Add Product</button>
            )}
            {tab === 'Categories' && (
              <button className="btn btn-primary" style={{ background: 'var(--brand-purple)', borderColor: 'var(--brand-purple)' }}>+ Add Category</button>
            )}
          </div>

          {/* DASHBOARD VIEW */}
          {tab === 'Dashboard' && (
            <div className="stats-grid">
              {[
                { label: 'Total Revenue', value: `₹${revenue.toFixed(2)}`, color: 'var(--brand-teal)' },
                { label: 'Total Orders', value: orders.length, color: 'inherit' },
                { label: 'Pending Orders', value: pending, color: 'var(--color-pending)' },
                { label: 'Low Stock Items', value: lowStock, color: lowStock > 0 ? 'var(--color-cancelled)' : 'var(--color-delivered)' },
              ].map(s => (
                <div key={s.label} className="stat-card">
                  <span className="stat-label">{s.label}</span>
                  <span className="stat-value" style={{ color: s.color }}>{s.value}</span>
                </div>
              ))}
            </div>
          )}

          {/* ORDERS VIEW */}
          {tab === 'Orders' && (
            <div className="table-responsive">
              {orders.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)' }}>No orders yet.</div>
              ) : (
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>#</th><th>Customer</th><th>Address</th><th>Items</th><th>Amount</th><th>Status</th><th>Update</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map(o => (
                      <tr key={o.id}>
                        <td><strong>#{o.id}</strong></td>
                        <td>
                          <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>{o.customer_name}</div>
                          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                            {o.customer_email}
                          </div>
                        </td>
                        <td style={{ fontSize: '0.85rem', maxWidth: 160 }}>{o.customer_address}</td>
                        <td>{o.order_items?.map(i => <div key={i.id} style={{ fontSize: '0.82rem' }}>· {i.products?.name || 'Item'} ×{i.quantity}</div>)}</td>
                        <td><strong>₹{parseFloat(o.total_amount).toFixed(2)}</strong></td>
                        <td><span className={`status-badge status-${o.status}`}>{o.status}</span></td>
                        <td>
                          <select value={o.status} onChange={e => handleStatusUpdate(o.id, e.target.value)}
                            className="form-control" style={{ padding: '0.3rem 0.5rem', width: '120px', fontSize: '0.82rem' }}>
                            <option value="pending">Pending</option>
                            <option value="shipped">Shipped</option>
                            <option value="delivered">Delivered</option>
                            <option value="cancelled">Cancelled</option>
                          </select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}

          {/* PRODUCTS VIEW */}
          {tab === 'Products' && (
            <div className="table-responsive">
              <table className="admin-table">
                <thead>
                  <tr><th>Image</th><th>Product</th><th>Category</th><th>Price</th><th>Stock</th><th style={{ textAlign: 'right' }}>Actions</th></tr>
                </thead>
                <tbody>
                  {products.map(p => (
                    <tr key={p.id}>
                       <td><img src={getImageUrl(p.image_urls && p.image_urls[0] ? p.image_urls[0] : '')} alt={p.name} style={{ width: 48, height: 48, objectFit: 'cover', borderRadius: 8 }} /></td>
                      <td>
                        <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>{p.name}</div>
                        <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', maxWidth: 240, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.description}</div>
                      </td>
                      <td><span className={`status-badge ${p.category === 'kitchen_cloths' ? 'status-delivered' : 'status-shipped'}`}>{p.category === 'kitchen_cloths' ? 'Kitchen' : 'Kids'}</span></td>
                      <td><strong>₹{parseFloat(p.price).toFixed(2)}</strong></td>
                      <td><span style={{ fontWeight: 700, color: p.stock <= 5 ? 'var(--color-cancelled)' : 'var(--color-delivered)' }}>{p.stock}</span></td>
                      <td style={{ textAlign: 'right' }}>
                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.4rem' }}>
                           <button className="btn btn-outline-info btn-sm" onClick={() => setViewProduct(p)}>
                             View
                           </button>
                           <button className="btn btn-secondary btn-sm" onClick={() => openEdit(p)}>Edit</button>
                           <button className="btn btn-sm" style={{ color: 'var(--color-cancelled)', borderColor: 'rgba(239,68,68,0.2)', background: 'rgba(239,68,68,0.05)' }} onClick={() => handleDelete(p.id)}>Delete</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

{/* Categories View */}
            {tab === 'Categories' && <CategoriesPage />}
            {/* Stock Alerts View */}
            {tab === 'Stock Alerts' && <StockAlertsPage />}
            {/* Analytics View */}
            {tab === 'Analytics' && <AnalyticsPage />}
        </div>

        {/* Product Modal */}
        {isModalOpen && (
          <div className="modal-overlay">
            <div className="modal-content">
              <div className="modal-header">
                <h3>{editingProduct ? 'Edit Product' : 'Add New Product'}</h3>
                <button className="close-btn" onClick={() => setIsModalOpen(false)}>×</button>
              </div>
              <form onSubmit={handleFormSubmit} className="checkout-form">
                <div className="form-group"><label className="form-label">Product Name</label><input type="text" className="form-control" value={productForm.name} onChange={e => setProductForm(p => ({ ...p, name: e.target.value }))} required /></div>
                <div className="form-group"><label className="form-label">Category</label>
                  <select 
                    className="form-control" 
                    value={productForm.category} 
                    onChange={e => {
                      const key = e.target.value;
                      const catId = getCategoryIdFromKey(key);
                      setProductForm(p => ({ 
                        ...p, 
                        category: key, 
                        category_id: catId ? catId.toString() : '', 
                        subcategory_id: '' 
                      }));
                    }} 
                    required
                  >
                    {categories.map(c => {
                      const key = c.name.toLowerCase().replace(/[^a-z0-9]+/g, '_');
                      return <option key={c.id} value={key}>{c.name}</option>;
                    })}
                  </select>
                </div>
                <div className="form-group"><label className="form-label">Subcategory</label>
                  <select 
                    className="form-control" 
                    value={productForm.subcategory_id} 
                    onChange={e => setProductForm(p => ({ ...p, subcategory_id: e.target.value }))}
                  >
                    <option value="">Select Subcategory (Optional)</option>
                    {subcategories
                      .filter(sub => {
                        const catId = getCategoryIdFromKey(productForm.category);
                        return sub.category_id === catId;
                      })
                      .map(sub => (
                        <option key={sub.id} value={sub.id}>{sub.name}</option>
                      ))
                    }
                  </select>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.85rem' }}>
                  <div className="form-group"><label className="form-label">Price (₹)</label><input type="number" step="0.01" className="form-control" value={productForm.price} onChange={e => setProductForm(p => ({ ...p, price: e.target.value }))} required /></div>
                  <div className="form-group"><label className="form-label">Stock (Units)</label><input type="number" className="form-control" value={productForm.stock} onChange={e => setProductForm(p => ({ ...p, stock: e.target.value }))} required /></div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.85rem' }}>
                  <div className="form-group"><label className="form-label">Discount (%)</label><input type="number" min="0" max="100" className="form-control" value={productForm.discount_percent} onChange={e => setProductForm(p => ({ ...p, discount_percent: e.target.value }))} /></div>
                  <div className="form-group"><label className="form-label">Sizes (comma-separated)</label><input type="text" placeholder="e.g. S, M, L" className="form-control" value={productForm.sizes} onChange={e => setProductForm(p => ({ ...p, sizes: e.target.value }))} /></div>
                </div>
                <div className="form-group"><label className="form-label">Colors (comma-separated Hex codes)</label><input type="text" placeholder="e.g. #ff0000, #0000ff" className="form-control" value={productForm.colors} onChange={e => setProductForm(p => ({ ...p, colors: e.target.value }))} /></div>
                  <div className="form-group">
                    <label className="form-label" style={{ fontWeight: 700 }}>Product Images (Max 10 total)</label>
                    
                    {/* Previews of Existing Images */}
                    {existingImages.length > 0 && (
                      <div style={{ marginBottom: '1rem' }}>
                        <div style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>Uploaded Images ({existingImages.length}):</div>
                        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                          {existingImages.map((img, idx) => (
                            <div key={idx} style={{ position: 'relative', width: '60px', height: '60px', border: '1px solid #ddd', borderRadius: '8px', overflow: 'hidden' }}>
                              <img src={getImageUrl(img)} alt="preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                              <button 
                                type="button"
                                onClick={() => setExistingImages(prev => prev.filter(u => u !== img))}
                                style={{
                                  position: 'absolute', top: 2, right: 2,
                                  background: 'rgba(239, 68, 68, 0.95)', color: '#fff', border: 'none',
                                  borderRadius: '50%', width: '18px', height: '18px',
                                  fontSize: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                  cursor: 'pointer'
                                }}
                                title="Delete Image"
                              >×</button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Previews of Newly Selected Images */}
                    {selectedFiles.length > 0 && (
                      <div style={{ marginBottom: '1rem' }}>
                        <div style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>Pending Uploads ({selectedFiles.length}):</div>
                        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                          {selectedFiles.map((file, idx) => {
                            const previewUrl = URL.createObjectURL(file);
                            return (
                              <div key={idx} style={{ position: 'relative', width: '60px', height: '60px', border: '1px solid #ddd', borderRadius: '8px', overflow: 'hidden' }}>
                                <img src={previewUrl} alt="preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                <button 
                                  type="button"
                                  onClick={() => setSelectedFiles(prev => prev.filter((_, i) => i !== idx))}
                                  style={{
                                    position: 'absolute', top: 2, right: 2,
                                    background: 'rgba(239, 68, 68, 0.95)', color: '#fff', border: 'none',
                                    borderRadius: '50%', width: '18px', height: '18px',
                                    fontSize: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    cursor: 'pointer'
                                  }}
                                  title="Remove Image"
                                >×</button>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    <input 
                      type="file" 
                      className="form-control" 
                      accept="image/*" 
                      multiple 
                      onChange={e => {
                        const files = Array.from(e.target.files);
                        setSelectedFiles(prev => [...prev, ...files]);
                        e.target.value = '';
                      }} 
                    />
                  </div>
                 <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', margin: '1rem 0' }}>
                   <input 
                     type="checkbox" 
                     id="is_featured" 
                     checked={productForm.is_featured} 
                     onChange={e => setProductForm(p => ({ ...p, is_featured: e.target.checked }))}
                     style={{ width: 'auto', margin: 0, cursor: 'pointer' }}
                   />
                   <label htmlFor="is_featured" style={{ fontWeight: 600, cursor: 'pointer', userSelect: 'none', color: 'var(--text-primary)' }}>Featured Product (Show on homepage)</label>
                 </div>
                <div className="form-group"><label className="form-label">Description</label><textarea className="form-control" rows="3" value={productForm.description} onChange={e => setProductForm(p => ({ ...p, description: e.target.value }))} /></div>
                <div className="modal-actions">
                  <button type="button" className="btn btn-secondary" onClick={() => setIsModalOpen(false)}>Cancel</button>
                  <button type="submit" className="btn btn-primary">Save Product</button>
                </div>
              </form>
            </div>
          </div>
        )}

        {viewProduct && <ProductViewModal product={viewProduct} onClose={() => setViewProduct(null)} />}

      </main>
    </div>
  );
}
