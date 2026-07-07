const express = require('express');
const router = express.Router();
const supabase = require('../config/supabase');
const adminAuth = require('../middleware/adminAuth');

// Get revenue statistics (total sales, sum of order totals) - Admin only
router.get('/revenue', adminAuth, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('orders')
      .select('total_amount')
      .order('created_at', { ascending: false });
    if (error) throw error;
    const totalRevenue = data.reduce((sum, order) => sum + parseFloat(order.total_amount), 0);
    res.json({ totalRevenue, orderCount: data.length });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get order count per day for the last 30 days - Admin only
router.get('/orders', adminAuth, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('orders')
      .select('created_at')
      .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())
      .order('created_at', { ascending: true });
    if (error) throw error;
    const stats = {};
    data.forEach(o => {
      const day = new Date(o.created_at).toISOString().split('T')[0];
      stats[day] = (stats[day] || 0) + 1;
    });
    res.json(stats);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get top-selling products (by quantity sold) - Admin only
router.get('/top-products', adminAuth, async (req, res) => {
  try {
    const { data, error } = await supabase
      .rpc('get_top_products') // Assuming a Postgres RPC function exists
      .select('*');
    if (error) throw error;
    res.json(data);
  } catch (err) {
    // Fallback: simple aggregation if rpc not present
    try {
      const { data: orderItems, error: err2 } = await supabase
        .from('order_items')
        .select('product_id, quantity');
      if (err2) throw err2;
      const tally = {};
      orderItems.forEach(item => {
        tally[item.product_id] = (tally[item.product_id] || 0) + item.quantity;
      });
      const top = Object.entries(tally)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10)
        .map(([product_id, quantity]) => ({ product_id, quantity }));
      res.json(top);
    } catch (fallbackErr) {
      res.status(500).json({ error: fallbackErr.message });
    }
  }
});

module.exports = router;
