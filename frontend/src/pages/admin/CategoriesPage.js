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
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{editingSubId ? 'Edit Subcategory' : 'Add Subcategory'}</h3>
              <button type="button" className="close-btn" onClick={() => setIsSubModalOpen(false)}>×</button>
            </div>
            <form onSubmit={handleSaveSubcategory} className="checkout-form">
              <div className="form-group">
                <label className="form-label">Subcategory Name</label>
                <input
                  type="text"
                  className="form-control"
                  value={subName}
                  onChange={(e) => setSubName(e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Image URL (Optional)</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Image URL"
                  value={subImageUrl}
                  onChange={(e) => setSubImageUrl(e.target.value)}
                />
              </div>
              {subImageUrl && (
                <div className="form-group">
                  <label className="form-label">Preview</label>
                  <img
                    src={subImageUrl}
                    alt="preview"
                    style={{
                      width: '100px',
                      height: '100px',
                      borderRadius: '8px',
                      objectFit: 'cover'
                    }}
                  />
                </div>
              )}
              <div className="modal-actions">
                <button type="button" className="btn btn-secondary" onClick={() => setIsSubModalOpen(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Save Subcategory</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CategoriesPage;
