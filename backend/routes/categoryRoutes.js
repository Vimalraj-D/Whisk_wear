const express = require('express');
const router = express.Router();
const supabase = require('../config/supabase');
const adminAuth = require('../middleware/adminAuth');

// List categories (public — needed by user-facing pages)
router.get('/', async (req, res) => {
  try {
    const { data, error } = await supabase.from('categories').select('id, name, image_url').order('name');
    if (error) throw error;
    res.json(data);
  } catch (err) {
    console.error('Category list error:', err);
    res.status(500).json({ error: err.message });
  }
});

// List subcategories
router.get('/subcategories', async (req, res) => {
  try {
    const { data, error } = await supabase.from('subcategories').select('id, name, category_id').order('name');
    if (error) throw error;
    res.json(data);
  } catch (err) {
    console.error('Subcategory list error:', err);
    res.status(500).json({ error: err.message });
  }
});

// Create category
router.post('/', adminAuth, async (req, res) => {
  const { name, image_url } = req.body;
  if (!name) return res.status(400).json({ error: 'Name required' });
  try {
    const insertData = { name };
    if (image_url) insertData.image_url = image_url;
    const { data, error } = await supabase.from('categories').insert([insertData]).select();
    if (error) throw error;
    res.status(201).json(data[0]);
  } catch (err) {
    console.error('Category create error:', err);
    res.status(500).json({ error: err.message });
  }
});

// Update category
router.put('/:id', adminAuth, async (req, res) => {
  const { id } = req.params;
  const { name, image_url } = req.body;
  if (!name) return res.status(400).json({ error: 'Name required' });
  try {
    const updateData = { name };
    if (image_url !== undefined) updateData.image_url = image_url;
    const { data, error } = await supabase.from('categories').update(updateData).eq('id', id).select();
    if (error) throw error;
    res.json(data[0]);
  } catch (err) {
    console.error('Category update error:', err);
    res.status(500).json({ error: err.message });
  }
});

// Delete category
router.delete('/:id', adminAuth, async (req, res) => {
  const { id } = req.params;
  try {
    const { error } = await supabase.from('categories').delete().eq('id', id);
    if (error) throw error;
    res.json({ success: true });
  } catch (err) {
    console.error('Category delete error:', err);
    res.status(500).json({ error: err.message });
  }
});

// Create subcategory (Admin only)
router.post('/subcategories', adminAuth, async (req, res) => {
  const { name, category_id } = req.body;
  if (!name || !category_id) return res.status(400).json({ error: 'Name and category_id required' });
  try {
    const { data, error } = await supabase.from('subcategories').insert([{ name, category_id: parseInt(category_id) }]).select();
    if (error) throw error;
    res.status(201).json(data[0]);
  } catch (err) {
    console.error('Subcategory create error:', err);
    res.status(500).json({ error: err.message });
  }
});

// Update subcategory (Admin only)
router.put('/subcategories/:id', adminAuth, async (req, res) => {
  const { id } = req.params;
  const { name } = req.body;
  if (!name) return res.status(400).json({ error: 'Name required' });
  try {
    const { data, error } = await supabase.from('subcategories').update({ name }).eq('id', id).select();
    if (error) throw error;
    res.json(data[0]);
  } catch (err) {
    console.error('Subcategory update error:', err);
    res.status(500).json({ error: err.message });
  }
});

// Delete subcategory (Admin only)
router.delete('/subcategories/:id', adminAuth, async (req, res) => {
  const { id } = req.params;
  try {
    const { error } = await supabase.from('subcategories').delete().eq('id', id);
    if (error) throw error;
    res.json({ success: true });
  } catch (err) {
    console.error('Subcategory delete error:', err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
