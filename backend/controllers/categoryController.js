const supabase = require('../config/supabase');

exports.getCategories = async (req, res) => {
  try {
    const { data, error } = await supabase.from('categories').select('id, name, image_url').order('name');
    if (error) throw error;
    res.json(data);
  } catch (err) {
    console.error('Category list error:', err);
    res.status(500).json({ error: err.message });
  }
};

exports.getSubcategories = async (req, res) => {
  try {
    const { data, error } = await supabase.from('subcategories').select('id, name, category_id').order('name');
    if (error) throw error;
    res.json(data);
  } catch (err) {
    console.error('Subcategory list error:', err);
    res.status(500).json({ error: err.message });
  }
};

exports.createCategory = async (req, res) => {
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
};

exports.updateCategory = async (req, res) => {
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
};

exports.deleteCategory = async (req, res) => {
  const { id } = req.params;
  try {
    const { count, error: countErr } = await supabase
      .from('products')
      .select('id', { count: 'exact', head: true })
      .eq('category_id', id);

    if (countErr) throw countErr;

    if (count && count > 0) {
      return res.status(400).json({
        error: `Cannot delete category: ${count} product(s) still reference it. Reassign or remove them first.`
      });
    }

    const { error } = await supabase.from('categories').delete().eq('id', id);
    if (error) throw error;
    res.json({ success: true });
  } catch (err) {
    console.error('Category delete error:', err);
    res.status(500).json({ error: err.message });
  }
};

exports.createSubcategory = async (req, res) => {
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
};

exports.updateSubcategory = async (req, res) => {
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
};

exports.deleteSubcategory = async (req, res) => {
  const { id } = req.params;
  try {
    const { error } = await supabase.from('subcategories').delete().eq('id', id);
    if (error) throw error;
    res.json({ success: true });
  } catch (err) {
    console.error('Subcategory delete error:', err);
    res.status(500).json({ error: err.message });
  }
};
