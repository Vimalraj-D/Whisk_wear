const express = require('express');
const router = express.Router();
const supabase = require('../config/supabase');
const adminAuth = require('../middleware/adminAuth');
const upload = require('../middleware/upload');

// Get all products, optionally filter by category
router.get('/', async (req, res) => {
  try {
    const { category } = req.query;
    let query = supabase.from('products').select('*');
    
    if (category) {
      query = query.eq('category', category);
    }
    
    query = query.order('id', { ascending: false });
    
    const { data, error } = await query;
    
    if (error) throw error;
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get a single product
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { data, error } = await supabase
      .from('products')
      .select('*,image_urls')
      .eq('id', id)
      .single();
      
    if (error) {
      return res.status(404).json({ error: 'Product not found' });
    }
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create a new product (Admin only) with image uploads
router.post('/', adminAuth, upload.array('images', 10), async (req, res) => {
  try {
    const { name, description, price, category, category_id, subcategory_id, is_featured, stock, discount_percent, sizes, colors } = req.body;
    const files = req.files;
    if (!name || !price || !category) {
      return res.status(400).json({ error: 'Name, price, and category are required' });
    }
    const sizesArray = typeof sizes === 'string' ? sizes.split(',').map(s => s.trim()).filter(Boolean) : (Array.isArray(sizes) ? sizes : []);
    const colorsArray = typeof colors === 'string' ? colors.split(',').map(c => c.trim()).filter(Boolean) : (Array.isArray(colors) ? colors : []);
    // Build array of image URLs (served from /uploads)
    const image_urls = files && files.length > 0 ? files.map(f => `/uploads/${f.filename}`) : [];
    const { data, error } = await supabase
      .from('products')
      .insert([{ 
        name, 
        description, 
        price: parseFloat(price), 
        category, 
        category_id: category_id ? parseInt(category_id) : null,
        subcategory_id: subcategory_id ? parseInt(subcategory_id) : null,
        is_featured: is_featured === 'true' || is_featured === true,
        discount_percent: parseInt(discount_percent) || 0,
        sizes: sizesArray,
        colors: colorsArray,
        image_urls, 
        stock: parseInt(stock) || 0 
      }])
      .select();
    if (error) throw error;
    res.status(201).json(data[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update a product (Admin only)
// Update a product (Admin only) with optional image uploads
router.put('/:id', adminAuth, upload.array('images', 10), async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, price, category, category_id, subcategory_id, is_featured, stock, discount_percent, sizes, colors, image_urls } = req.body;
    // Build update fields
    const updateFields = {};
    if (name !== undefined) updateFields.name = name;
    if (description !== undefined) updateFields.description = description;
    if (price !== undefined) updateFields.price = parseFloat(price);
    if (category !== undefined) updateFields.category = category;
    if (category_id !== undefined) updateFields.category_id = category_id ? parseInt(category_id) : null;
    if (subcategory_id !== undefined) updateFields.subcategory_id = subcategory_id ? parseInt(subcategory_id) : null;
    if (is_featured !== undefined) updateFields.is_featured = is_featured === 'true' || is_featured === true;
    if (discount_percent !== undefined) updateFields.discount_percent = parseInt(discount_percent) || 0;
    if (sizes !== undefined) {
      updateFields.sizes = typeof sizes === 'string' ? sizes.split(',').map(s => s.trim()).filter(Boolean) : (Array.isArray(sizes) ? sizes : []);
    }
    if (colors !== undefined) {
      updateFields.colors = typeof colors === 'string' ? colors.split(',').map(c => c.trim()).filter(Boolean) : (Array.isArray(colors) ? colors : []);
    }
    if (stock !== undefined) updateFields.stock = parseInt(stock);

    let remainingUrls = [];
    if (image_urls !== undefined) {
      remainingUrls = typeof image_urls === 'string' ? image_urls.split(',').map(u => u.trim()).filter(Boolean) : (Array.isArray(image_urls) ? image_urls : []);
      updateFields.image_urls = remainingUrls;
    }

    // Handle image uploads
    const files = req.files;
    if (files && files.length > 0) {
      const newUrls = files.map(f => `/uploads/${f.filename}`);
      if (updateFields.image_urls) {
        updateFields.image_urls = [...updateFields.image_urls, ...newUrls];
      } else {
        const { data: existingData, error: fetchError } = await supabase
          .from('products')
          .select('image_urls')
          .eq('id', id)
          .single();
        if (fetchError) throw fetchError;
        const existingUrls = existingData.image_urls || [];
        updateFields.image_urls = [...existingUrls, ...newUrls];
      }
    }
    const { data, error } = await supabase
      .from('products')
      .update(updateFields)
      .eq('id', id)
      .select();
    if (error) throw error;
    if (!data || data.length === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }
    res.json(data[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete a product (Admin only)
router.delete('/:id', adminAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const { data, error } = await supabase
      .from('products')
      .delete()
      .eq('id', id)
      .select();
      
    if (error) throw error;
    if (!data || data.length === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }
    res.json({ message: 'Product deleted successfully', product: data[0] });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
