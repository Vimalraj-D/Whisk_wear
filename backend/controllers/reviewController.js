const supabase = require('../config/supabase');

exports.getReviews = async (req, res) => {
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
};

exports.createReview = async (req, res) => {
  try {
    const { product_id, rating, comment } = req.body;

    if (!product_id || !rating) {
      return res.status(400).json({ error: 'product_id and rating are required' });
    }

    if (rating < 1 || rating > 5) {
      return res.status(400).json({ error: 'Rating must be between 1 and 5' });
    }

    const { data: userRecord, error: userErr } = await supabase
      .from('users')
      .select('name')
      .eq('id', req.user.id)
      .single();
    if (userErr || !userRecord) {
      return res.status(400).json({ error: 'Unable to verify reviewer identity' });
    }

    // Prevent duplicate reviews from the same user on the same product
    const { data: duplicate, error: dupErr } = await supabase
      .from('reviews')
      .select('id')
      .eq('product_id', product_id)
      .eq('user_name', userRecord.name)
      .maybeSingle();

    if (!dupErr && duplicate) {
      return res.status(409).json({ error: 'You have already reviewed this product.' });
    }

    const { data, error } = await supabase
      .from('reviews')
      .insert([{ product_id, user_name: userRecord.name, rating, comment }])
      .select();

    if (error) throw error;
    res.status(201).json(data[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getAllReviews = async (req, res) => {
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
};

exports.updateReview = async (req, res) => {
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
};

exports.deleteReview = async (req, res) => {
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
};
