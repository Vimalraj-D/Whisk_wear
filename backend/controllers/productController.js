const supabase = require('../config/supabase');
const { DeleteObjectCommand } = require('@aws-sdk/client-s3');
const { s3Config } = require('../middleware/upload');
const sanitizeHtml = require('sanitize-html');

async function deleteImagesFromS3(urls) {
  if (!urls || urls.length === 0) return;
  const bucket = process.env.SUPABASE_S3_BUCKET || 'Images';
  for (const url of urls) {
    try {
      if (url.includes(`/public/${bucket}/`)) {
        const key = url.split(`/public/${bucket}/`)[1];
        await s3Config.send(new DeleteObjectCommand({ Bucket: bucket, Key: key }));
      }
    } catch (e) {
      console.error('Failed to delete image from S3:', e);
    }
  }
}

exports.getProducts = async (req, res) => {
  try {
    const { category, page = 1, limit = 20 } = req.query;
    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit)));
    const offset = (pageNum - 1) * limitNum;

    let query = supabase.from('products').select('*', { count: 'exact' });

    if (category) {
      query = query.eq('category', category);
    }

    query = query.order('id', { ascending: false }).range(offset, offset + limitNum - 1);

    const { data, error, count } = await query;
    if (error) throw error;

    res.json({
      data,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total: count,
        totalPages: Math.ceil(count / limitNum),
      },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getProduct = async (req, res) => {
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
};

exports.createProduct = async (req, res) => {
  try {
    const { name, description, price, category, category_id, subcategory_id, is_featured, stock, discount_percent, sizes, colors } = req.body;
    const files = req.files;
    if (!name || !price || !category) {
      return res.status(400).json({ error: 'Name, price, and category are required' });
    }
    const sizesArray = typeof sizes === 'string' ? sizes.split(',').map(s => s.trim()).filter(Boolean) : (Array.isArray(sizes) ? sizes : []);
    const colorsArray = typeof colors === 'string' ? colors.split(',').map(c => c.trim()).filter(Boolean) : (Array.isArray(colors) ? colors : []);
    const projectId = process.env.SUPABASE_PROJECT_ID || 'aoppjuuqdgajcidduqld';
    const bucket = process.env.SUPABASE_S3_BUCKET || 'Images';
    const image_urls = files && files.length > 0 ? files.map(f => `https://${projectId}.supabase.co/storage/v1/object/public/${bucket}/${f.key}`) : [];
    const sanitizedDescription = description ? sanitizeHtml(description) : '';
    const { data, error } = await supabase
      .from('products')
      .insert([{
        name,
        description: sanitizedDescription,
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
};

exports.updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, price, category, category_id, subcategory_id, is_featured, stock, discount_percent, sizes, colors, image_urls } = req.body;
    const updateFields = {};
    if (name !== undefined) updateFields.name = name;
    if (description !== undefined) updateFields.description = sanitizeHtml(description);
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

    const { data: existingData, error: fetchError } = await supabase
      .from('products')
      .select('image_urls')
      .eq('id', id)
      .single();
    if (fetchError) throw fetchError;
    const existingUrls = existingData.image_urls || [];

    let remainingUrls = [];
    if (image_urls !== undefined) {
      remainingUrls = typeof image_urls === 'string' ? image_urls.split(',').map(u => u.trim()).filter(Boolean) : (Array.isArray(image_urls) ? image_urls : []);
      updateFields.image_urls = remainingUrls;

      const removedUrls = existingUrls.filter(oldUrl => !remainingUrls.includes(oldUrl));
      if (removedUrls.length > 0) {
        await deleteImagesFromS3(removedUrls);
      }
    }

    const files = req.files;
    if (files && files.length > 0) {
      const projectId = process.env.SUPABASE_PROJECT_ID || 'aoppjuuqdgajcidduqld';
      const bucket = process.env.SUPABASE_S3_BUCKET || 'Images';
      const newUrls = files.map(f => `https://${projectId}.supabase.co/storage/v1/object/public/${bucket}/${f.key}`);
      if (updateFields.image_urls) {
        updateFields.image_urls = [...updateFields.image_urls, ...newUrls];
      } else {
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
};

exports.deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const { data: existingData, error: fetchError } = await supabase
      .from('products')
      .select('image_urls')
      .eq('id', id)
      .single();

    if (fetchError) throw fetchError;

    const { data, error } = await supabase
      .from('products')
      .delete()
      .eq('id', id)
      .select();

    if (existingData && existingData.image_urls && existingData.image_urls.length > 0) {
      await deleteImagesFromS3(existingData.image_urls);
    }
    if (error) throw error;
    if (!data || data.length === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }
    res.json({ message: 'Product deleted successfully', product: data[0] });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
