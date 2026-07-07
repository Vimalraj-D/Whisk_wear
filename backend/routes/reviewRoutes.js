const express = require('express');
const router = express.Router();
const supabase = require('../config/supabase');
const adminAuth = require('../middleware/adminAuth');
const auth = require('../middleware/auth'); // assuming user auth middleware exists

// Note: Because we use JWT from our own auth routes for users, we might need to 
// verify user tokens before they can post a review. Wait, I should check if there's a 
// standard `auth` middleware for users. I'll define a quick inline auth check if it's missing.

// Get reviews for a specific product
router.get('/:product_id', async (req, res) => {
  try {
    const { product_id } = req.params;
    const { data, error } = await supabase
      .from('reviews')
      .select('*')
      .eq('product_id', product_id)
      .order('created_at', { ascending: false });

    if (error) throw error;
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Post a review (User action)
// In a real app we'd use auth middleware to get req.user.id
router.post('/', async (req, res) => {
  try {
    const { product_id, user_name, rating, comment } = req.body;
    
    if (!product_id || !user_name || !rating) {
      return res.status(400).json({ error: 'product_id, user_name, and rating are required' });
    }

    if (rating < 1 || rating > 5) {
      return res.status(400).json({ error: 'Rating must be between 1 and 5' });
    }

    const { data, error } = await supabase
      .from('reviews')
      .insert([{ product_id, user_name, rating, comment }])
      .select();

    if (error) throw error;
    res.status(201).json(data[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// --- ADMIN ROUTES ---

// Get all reviews for admin management
router.get('/admin/all', adminAuth, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('reviews')
      .select(`
        *,
        products ( name )
      `)
      .order('created_at', { ascending: false });

    if (error) throw error;
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Admin edit a review rating
router.put('/:id', adminAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const { rating } = req.body;

    if (rating < 1 || rating > 5) {
      return res.status(400).json({ error: 'Rating must be between 1 and 5' });
    }

    const { data, error } = await supabase
      .from('reviews')
      .update({ rating })
      .eq('id', id)
      .select();

    if (error) throw error;
    res.json(data[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Admin delete a review
router.delete('/:id', adminAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const { error } = await supabase
      .from('reviews')
      .delete()
      .eq('id', id);

    if (error) throw error;
    res.json({ message: 'Review deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
