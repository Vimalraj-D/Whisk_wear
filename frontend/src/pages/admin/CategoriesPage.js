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

  const handleAddSub = async (catId) => {
    const name = prompt('Enter new subcategory name:');
    if (!name || !name.trim()) return;
    try {
      await apiService.createSubcategory(name.trim(), catId, token);
      fetchCategories();
    } catch (err) {
      console.error('Add subcategory error', err);
    }
  };

  const handleEditSub = async (sub) => {
    const newName = prompt('Enter new subcategory name:', sub.name);
    if (!newName || !newName.trim() || newName.trim() === sub.name) return;
    try {
      await apiService.updateSubcategory(sub.id, newName.trim(), token);
      fetchCategories();
    } catch (err) {
      console.error('Edit subcategory error', err);
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
                        {s.name}
                        <button 
                          onClick={() => handleEditSub(s)} 
                          style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, fontSize: '0.7rem', color: 'var(--color-primary, #e67e22)' }}
                          title="Edit Subcategory"
                        >✏️</button>
                        <button 
                          onClick={() => handleDeleteSub(s.id)} 
                          style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, fontSize: '0.7rem', color: 'var(--color-cancelled, #ef4444)' }}
                          title="Delete Subcategory"
                        >✕</button>
                      </span>
                    ))}
                    <button 
                      className="btn btn-outline-teal btn-sm" 
                      onClick={() => handleAddSub(cat.id)}
                      style={{ padding: '0.1rem 0.4rem', fontSize: '0.75rem', borderRadius: '4px' }}
                    >
                      + Add Sub
                    </button>
                  </div>
                </td>
                <td>
                  {editing !== cat.id && (
                    <>
                      <button className="btn btn-outline-primary btn-sm" onClick={() => startEdit(cat)}>
                        Edit
                      </button>
                      <button className="btn btn-outline-danger btn-sm" onClick={() => handleDelete(cat.id)}>
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
    </div>
  );
};

export default CategoriesPage;
