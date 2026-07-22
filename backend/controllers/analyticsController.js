const supabase = require('../config/supabase');

exports.getRevenue = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('orders')
      .select('total_amount')
      .not('status', 'eq', 'cancelled');

    if (error) throw error;

    const totalRevenue = data.reduce((sum, order) => sum + parseFloat(order.total_amount), 0);
    res.json({ totalRevenue: Math.round(totalRevenue * 100) / 100, orderCount: data.length });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getOrderStats = async (req, res) => {
  try {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();

    const { data, error } = await supabase
      .from('orders')
      .select('created_at')
      .gte('created_at', thirtyDaysAgo)
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
};

exports.getTopProducts = async (req, res) => {
  try {
    const { data, error } = await supabase.rpc('get_top_products');
    if (error) throw error;
    if (data && data.length > 0) return res.json(data);

    // Fallback: manual aggregation
    const { data: orderItems, error: err2 } = await supabase
      .from('order_items')
      .select('product_id, quantity');
    if (err2) throw err2;

    const tally = {};
    (orderItems || []).forEach(item => {
      tally[item.product_id] = (tally[item.product_id] || 0) + item.quantity;
    });
    const top = Object.entries(tally)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([product_id, quantity]) => ({ product_id, quantity }));
    res.json(top);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
