import React, { useEffect, useState } from 'react';
import { apiService } from '../../api';
import './CategoriesPage.css';

const CategoriesPage = () => {
  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [newName, setNewName] = useState('');
  const [newImageUrl, setNewImageUrl] = useState('');
  const [editing, setEditing] = useState(null);
  const [editName, setEditName] = useState('');
  const [editImageUrl, setEditImageUrl] = useState('');
  
  // Subcategory modal state
  const [isSubModalOpen, setIsSubModalOpen] = useState(false);
  const [editingSubId, setEditingSubId] = useState(null);
  const [editingCatId, setEditingCatId] = useState(null);
  const [subName, setSubName] = useState('');
  const [subImageUrl, setSubImageUrl] = useState('');

  const token = localStorage.getItem('whiskwear_admin_token');

  const fetchCategories = async () => {
    try {
      const [catRes, subRes] = await Promise.all([
        apiService.getCategories(token),
        apiService.getSubcategories()
      ]);
      setCategories(catRes.data || catRes);
      setSubcategories(subRes.data || subRes);
    } catch (err) {
      console.error('Failed to load categories/subcategories', err);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const openSubModal = (catId, sub = null) => {
    setEditingCatId(catId);
    if (sub) {
      setEditingSubId(sub.id);
      setSubName(sub.name);
      setSubImageUrl(sub.image_url || '');
    } else {
      setEditingSubId(null);
      setSubName('');
      setSubImageUrl('');
    }
    setIsSubModalOpen(true);
  };

  const handleSaveSubcategory = async (e) => {
    e.preventDefault();
    if (!subName.trim()) return;
    try {
      if (editingSubId) {
        await apiService.updateSubcategory(editingSubId, subName.trim(), subImageUrl, token);
      } else {
        await apiService.createSubcategory(subName.trim(), editingCatId, subImageUrl, token);
      }
      setIsSubModalOpen(false);
      fetchCategories();
    } catch (err) {
      console.error('Save subcategory error', err);
    }
  };

  const handleDeleteSub = async (id) => {
    if (!window.confirm('Delete this subcategory?')) return;
    try {
      await apiService.deleteSubcategory(id, token);
      fetchCategories();
    } catch (err) {
      console.error('Delete subcategory error', err);
    }
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!newName) return;
    try {
      await apiService.createCategory({ name: newName, image_url: newImageUrl }, token);
      setNewName('');
      setNewImageUrl('');
      fetchCategories();
    } catch (err) {
      console.error('Add category error', err);
    }
  };

  const startEdit = (cat) => {
    setEditing(cat.id);
    setEditName(cat.name);
    setEditImageUrl(cat.image_url || '');
  };

  const handleEdit = async (e) => {
    e.preventDefault();
    try {
      await apiService.updateCategory(editing, { name: editName, image_url: editImageUrl }, token);
      setEditing(null);
      fetchCategories();
    } catch (err) {
      console.error('Edit category error', err);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this category?')) return;
    try {
      await apiService.deleteCategory(id, token);
      fetchCategories();
    } catch (err) {
      console.error('Delete category error', err);
    }
  };

  return (
    <div className="admin-categories">
      <h2 className="section-title">Manage Categories</h2>
      <form className="add-category" onSubmit={handleAdd}>
        <input
          type="text"
          placeholder="New category name"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          required
        />
        <input
          type="text"
          placeholder="Image URL (optional)"
          value={newImageUrl}
          onChange={(e) => setNewImageUrl(e.target.value)}
        />
        <button type="submit" className="btn btn-primary">
          Add Category
        </button>
      </form>

      <table className="category-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Subcategories</th>
            <th style={{ width: '150px' }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {categories.map((cat) => {
            const subs = subcategories.filter(s => s.category_id === cat.id);
            return (
              <tr key={cat.id}>
                <td>{editing === cat.id ? (
                  <form onSubmit={handleEdit} className="edit-form">
                    <input
                      type="text"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      required
                    />
                    <input
                      type="text"
                      placeholder="Image URL"
                      value={editImageUrl}
                      onChange={(e) => setEditImageUrl(e.target.value)}
                    />
                    <button type="submit" className="btn btn-success btn-sm">Save</button>
                    <button type="button" className="btn btn-secondary btn-sm" onClick={() => setEditing(null)}>
                      Cancel
                    </button>
                  </form>
                ) : (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    {cat.image_url && (
                      <img
                        src={cat.image_url}
                        alt={cat.name}
                        style={{
                          width: '40px',
                          height: '40px',
                          borderRadius: '6px',
                          objectFit: 'cover'
                        }}
                      />
                    )}
                    {cat.name}
                  </div>
                )}</td>
                <td>
                  <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', alignItems: 'center' }}>
                    {subs.map(s => (
                      <span 
                        key={s.id} 
                        style={{ 
                          background: 'var(--bg-secondary, #eee)', 
                          padding: '0.2rem 0.5rem', 
                          borderRadius: '4px', 
                          fontSize: '0.78rem',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.25rem'
                        }}
                      >
                        {s.image_url && (
                          <img
                            src={s.image_url}
                            alt={s.name}
                            style={{
                              width: '20px',
                              height: '20px',
                              borderRadius: '3px',
                              objectFit: 'cover'
                            }}
                          />
                        )}
                        {s.name}
                        <button 
                          type="button"
                          onClick={() => openSubModal(cat.id, s)} 
                          style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, fontSize: '0.7rem', color: 'var(--color-primary, #e67e22)' }}
                          title="Edit Subcategory"
                        >✏️</button>
                        <button 
                          type="button"
                          onClick={() => handleDeleteSub(s.id)} 
                          style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, fontSize: '0.7rem', color: 'var(--color-cancelled, #ef4444)' }}
                          title="Delete Subcategory"
                        >✕</button>
                      </span>
                    ))}
                    <button 
                      type="button"
                      className="btn btn-outline-teal btn-sm" 
                      onClick={() => openSubModal(cat.id)}
                      style={{ padding: '0.1rem 0.4rem', fontSize: '0.75rem', borderRadius: '4px' }}
                    >
                      + Add Sub
                    </button>
                  </div>
                </td>
                <td>
                  {editing !== cat.id && (
                    <>
                      <button type="button" className="btn btn-outline-primary btn-sm" onClick={() => startEdit(cat)}>
                        Edit
                      </button>
                      <button type="button" className="btn btn-outline-danger btn-sm" onClick={() => handleDelete(cat.id)}>
                        Delete
                      </button>
                    </>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {/* Subcategory Modal */}
      {isSubModalOpen && (
        <div className="modal-overlay" onClick={() => setIsSubModalOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '500px' }}>
            <div className="modal-header">
              <h3>{editingSubId ? 'Edit Subcategory' : 'Add Subcategory'}</h3>
              <button type="button" className="close-btn" onClick={() => setIsSubModalOpen(false)}>×</button>
            </div>
            <form onSubmit={handleSaveSubcategory} className="checkout-form">
              
              {/* Subcategory Name */}
              <div className="form-group">
                <label className="form-label" style={{ fontWeight: '600', marginBottom: '0.5rem', display: 'block' }}>Subcategory Name *</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="e.g., Coat, Hat, Shoe"
                  value={subName}
                  onChange={(e) => setSubName(e.target.value)}
                  required
                  style={{ padding: '0.75rem', borderRadius: '6px' }}
                />
              </div>

              {/* Image Section with Prominent Styling */}
              <div className="form-group" style={{ 
                background: 'linear-gradient(135deg, #f5f7fa 0%, #f0f3f7 100%)',
                padding: '1.5rem',
                borderRadius: '12px',
                border: '2px dashed var(--brand-teal, #16a085)',
                marginBottom: '1.5rem'
              }}>
                <label className="form-label" style={{ 
                  fontWeight: '700', 
                  marginBottom: '0.75rem', 
                  display: 'block',
                  color: 'var(--brand-teal, #16a085)',
                  fontSize: '1rem',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px'
                }}>
                  📸 Subcategory Image
                </label>
                <p style={{ 
                  fontSize: '0.85rem', 
                  color: 'var(--text-secondary)', 
                  marginBottom: '1rem',
                  fontStyle: 'italic'
                }}>
                  Paste image URL to display in collections. This image will show with the subcategory name.
                </p>
                
                <input
                  type="text"
                  className="form-control"
                  placeholder="e.g., https://example.com/image.jpg"
                  value={subImageUrl}
                  onChange={(e) => setSubImageUrl(e.target.value)}
                  style={{ 
                    padding: '0.75rem', 
                    borderRadius: '6px',
                    border: '1px solid var(--border-color, #e0e0e0)',
                    marginBottom: '1rem'
                  }}
                />

                {/* Image Preview */}
                {subImageUrl ? (
                  <div style={{
                    background: '#fff',
                    padding: '1rem',
                    borderRadius: '8px',
                    textAlign: 'center',
                    border: '1px solid var(--border-color, #e0e0e0)'
                  }}>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.75rem' }}>Preview:</p>
                    <img
                      src={subImageUrl}
                      alt="preview"
                      style={{
                        maxWidth: '100%',
                        maxHeight: '180px',
                        borderRadius: '8px',
                        objectFit: 'cover',
                        margin: '0 auto',
                        display: 'block',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                      }}
                      onError={(e) => {
                        console.log('Image load error:', e);
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => setSubImageUrl('')}
                      style={{
                        marginTop: '0.75rem',
                        background: 'none',
                        border: '1px solid var(--color-cancelled, #ef4444)',
                        color: 'var(--color-cancelled, #ef4444)',
                        padding: '0.4rem 0.8rem',
                        borderRadius: '4px',
                        fontSize: '0.8rem',
                        cursor: 'pointer',
                        transition: 'all 0.2s'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = 'var(--color-cancelled, #ef4444)';
                        e.currentTarget.style.color = '#fff';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'none';
                        e.currentTarget.style.color = 'var(--color-cancelled, #ef4444)';
                      }}
                    >
                      Clear Image
                    </button>
                  </div>
                ) : (
                  <div style={{
                    background: '#fff',
                    padding: '2rem 1rem',
                    borderRadius: '8px',
                    textAlign: 'center',
                    border: '1px dashed var(--border-color, #e0e0e0)',
                    color: 'var(--text-muted)'
                  }}>
                    <p style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>🖼️</p>
                    <p style={{ fontSize: '0.9rem' }}>No image selected</p>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="modal-actions" style={{ 
                display: 'flex', 
                gap: '1rem', 
                justifyContent: 'flex-end',
                marginTop: '2rem',
                paddingTop: '1.5rem',
                borderTop: '1px solid var(--border-color, #e0e0e0)'
              }}>
                <button 
                  type="button" 
                  className="btn btn-secondary" 
                  onClick={() => setIsSubModalOpen(false)}
                  style={{ padding: '0.75rem 1.5rem', borderRadius: '6px' }}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="btn btn-primary"
                  style={{ 
                    padding: '0.75rem 1.5rem', 
                    borderRadius: '6px',
                    background: 'var(--brand-teal, #16a085)',
                    color: '#fff',
                    fontWeight: '600',
                    border: 'none',
                    cursor: 'pointer'
                  }}
                >
                  {editingSubId ? '✓ Update Subcategory' : '✓ Add Subcategory'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CategoriesPage;
