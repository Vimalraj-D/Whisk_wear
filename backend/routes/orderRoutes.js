const express = require('express');
const router = express.Router();
const supabase = require('../config/supabase');
const adminAuth = require('../middleware/auth');
const userAuth = require('../middleware/userAuth');

// Create a new order (Checkout)
router.post('/', async (req, res) => {
  try {
    const { customer_name, customer_email, customer_address, items } = req.body;
    
    if (!customer_name || !customer_email || !customer_address || !items || items.length === 0) {
      return res.status(400).json({ error: 'All order details and items are required' });
    }
    
    // Check if user is logged in (optional user_id mapping)
    let user_id = null;
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer user_token_')) {
      const token = authHeader.split(' ')[1];
      const parts = token.replace('user_token_', '').split('_');
      if (parts[0]) {
        user_id = parseInt(parts[0]);
      }
    }
    
    // Calculate total amount
    let total_amount = 0;
    for (const item of items) {
      total_amount += item.price * item.quantity;
    }
    
    // Insert order
    const { data: orderData, error: orderError } = await supabase
      .from('orders')
      .insert([{
        user_id,
        customer_name,
        customer_email,
        customer_address,
        total_amount: parseFloat(total_amount),
        status: 'pending'
      }])
      .select();
      
    if (orderError) throw orderError;
    
    const newOrder = orderData[0];
    
    // Prepare order items
    const orderItemsToInsert = items.map(item => ({
      order_id: newOrder.id,
      product_id: item.product_id,
      quantity: parseInt(item.quantity),
      price: parseFloat(item.price)
    }));
    
    // Insert order items
    const { error: itemsError } = await supabase
      .from('order_items')
      .insert(orderItemsToInsert);
      
    if (itemsError) {
      // Clean up the order if items insert fails
      await supabase.from('orders').delete().eq('id', newOrder.id);
      throw itemsError;
    }
    
    // Update product stock levels and sales count (best effort)
    for (const item of items) {
      try {
        const { data: prodData } = await supabase.from('products').select('stock, sales_count').eq('id', item.product_id).single();
        if (prodData) {
          const newStock = Math.max(0, prodData.stock - item.quantity);
          const newSales = (prodData.sales_count || 0) + item.quantity;
          await supabase.from('products').update({ stock: newStock, sales_count: newSales }).eq('id', item.product_id);
        }
      } catch (stockErr) {
        console.error('Failed to update stock/sales for product', item.product_id, stockErr);
      }
    }
    
    res.status(201).json({
      message: 'Order created successfully',
      order: newOrder
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get logged-in user's orders (User only)
router.get('/my-orders', userAuth, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('orders')
      .select(`
        *,
        order_items (
          id,
          quantity,
          price,
          products (
            id,
            name,
            image_urls,
            category
          )
        )
      `)
      .eq('user_id', req.user.id)
      .order('id', { ascending: false });
      
    if (error) throw error;
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get all orders (Admin only)
router.get('/', adminAuth, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('orders')
      .select(`
        *,
        order_items (
          id,
          quantity,
          price,
          products (
            id,
            name,
            image_urls,
            category
          )
        )
      `)
      .order('id', { ascending: false });
      
    if (error) throw error;
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update order status (Admin only)
router.put('/:id', adminAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    if (!status) {
      return res.status(400).json({ error: 'Status is required' });
    }
    
    const { data, error } = await supabase
      .from('orders')
      .update({ status })
      .eq('id', id)
      .select();
      
    if (error) throw error;
    if (!data || data.length === 0) {
      return res.status(404).json({ error: 'Order not found' });
    }
    res.json(data[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
