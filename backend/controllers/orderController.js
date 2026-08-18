const supabase = require('../config/supabase');
const Razorpay = require('razorpay');
const crypto = require('crypto');
const { sendOrderConfirmationEmail } = require('../services/emailService');
const { calculateShipping } = require('../utils/shipping');

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

async function priceOrderItems(items) {
  if (!Array.isArray(items) || items.length === 0) {
    throw Object.assign(new Error('No items provided'), { status: 400 });
  }
  const productIds = [...new Set(items.map(i => i.product_id))];
  const { data: products, error } = await supabase
    .from('products')
    .select('id, price, discount_percent, stock')
    .in('id', productIds);
  if (error) throw error;

  const priceById = {};
  const stockById = {};
  for (const p of products) {
    const discount = p.discount_percent || 0;
    priceById[p.id] = Math.round((p.price * (1 - discount / 100)) * 100) / 100;
    stockById[p.id] = p.stock;
  }

  const qtyByProduct = {};
  for (const item of items) {
    const qty = parseInt(item.quantity);
    if (!qty || qty <= 0) {
      throw Object.assign(new Error('Invalid quantity'), { status: 400 });
    }
    if (priceById[item.product_id] === undefined) {
      throw Object.assign(new Error(`Product ${item.product_id} not found`), { status: 400 });
    }
    qtyByProduct[item.product_id] = (qtyByProduct[item.product_id] || 0) + qty;
  }
  for (const [productId, totalQty] of Object.entries(qtyByProduct)) {
    if (stockById[productId] !== undefined && totalQty > stockById[productId]) {
      throw Object.assign(new Error(`Insufficient stock for product ${productId}`), { status: 400 });
    }
  }

  let total_amount = 0;
  for (const item of items) {
    const unitPrice = priceById[item.product_id];
    const qty = parseInt(item.quantity);
    total_amount += unitPrice * qty;
  }

  return { total_amount: Math.round(total_amount * 100) / 100, priceById };
}

async function decrementStockAtomic(items) {
  const qtyByProduct = {};
  for (const item of items) {
    const qty = parseInt(item.quantity);
    qtyByProduct[item.product_id] = (qtyByProduct[item.product_id] || 0) + qty;
  }

  const applied = [];
  for (const [productId, qty] of Object.entries(qtyByProduct)) {
    // 1. Fetch current stock
    const { data: product, error: fetchError } = await supabase
      .from('products')
      .select('stock, name')
      .eq('id', Number(productId))
      .single();

    if (fetchError || !product) {
      await rollbackStock(applied);
      throw Object.assign(new Error(`Failed to fetch stock for product ${productId}: ${fetchError?.message || 'Product not found'}`), { status: 500 });
    }

    if (product.stock < qty) {
      await rollbackStock(applied);
      throw Object.assign(new Error(`Insufficient stock for product "${product.name}" (Requested: ${qty}, Available: ${product.stock})`), { status: 409 });
    }

    // 2. Decrement stock
    const { error: updateError } = await supabase
      .from('products')
      .update({ stock: product.stock - qty })
      .eq('id', Number(productId));

    if (updateError) {
      await rollbackStock(applied);
      throw Object.assign(new Error(`Stock update failed for product ${productId}: ${updateError.message}`), { status: 500 });
    }

    applied.push({ productId: Number(productId), qty, prevStock: product.stock });
  }
}

async function rollbackStock(applied) {
  for (const { productId, prevStock } of applied) {
    try {
      await supabase
        .from('products')
        .update({ stock: prevStock })
        .eq('id', productId);
    } catch (e) {
      console.error(`Failed to roll back stock for product ${productId}:`, e);
    }
  }
}

async function fetchProductDetailsForEmail(items) {
  const productIds = [...new Set(items.map(i => i.product_id))];
  const { data: products } = await supabase
    .from('products')
    .select('id, name, image_urls')
    .in('id', productIds);
  const detailsById = {};
  if (products) {
    for (const p of products) {
      detailsById[p.id] = p;
    }
  }
  return items.map(item => {
    const product = detailsById[item.product_id] || {};
    return {
      name: product.name || 'Product',
      quantity: item.quantity,
      price: item.price,
      image_url: (product.image_urls && product.image_urls[0]) || '',
    };
  });
}

exports.createOrder = async (req, res) => {
  try {
    const { customer_name, customer_email, customer_address, zip, items } = req.body;

    if (!customer_name || !customer_email || !customer_address || !items || items.length === 0) {
      return res.status(400).json({ error: 'All order details and items are required' });
    }

    const user_id = req.user ? req.user.id : null;
    const { total_amount: items_amount, priceById } = await priceOrderItems(items);

    let shipping_charge = 0;
    if (zip) {
      const shippingInfo = await calculateShipping(zip);
      shipping_charge = shippingInfo.shipping_charge;
    }

    const grand_total = items_amount + shipping_charge;

    const { data: orderData, error: orderError } = await supabase
      .from('orders')
      .insert([{
        user_id,
        customer_name,
        customer_email,
        customer_address,
        total_amount: parseFloat(grand_total),
        shipping_charge: parseFloat(shipping_charge),
        status: 'pending'
      }])
      .select();

    if (orderError) throw orderError;
    const newOrder = orderData[0];

    const orderItemsToInsert = items.map(item => ({
      order_id: newOrder.id,
      product_id: item.product_id,
      quantity: parseInt(item.quantity),
      price: priceById[item.product_id]
    }));

    const { error: itemsError } = await supabase
      .from('order_items')
      .insert(orderItemsToInsert);

    if (itemsError) {
      await supabase.from('orders').delete().eq('id', newOrder.id);
      throw itemsError;
    }

    try {
      await decrementStockAtomic(items);
    } catch (stockErr) {
      await supabase.from('orders').delete().eq('id', newOrder.id);
      throw stockErr;
    }

    res.status(201).json({
      message: 'Order created successfully',
      order: newOrder
    });
  } catch (error) {
    res.status(error.status || 500).json({ error: error.message });
  }
};

exports.getShippingCharge = async (req, res) => {
  try {
    const { pincode } = req.query;
    if (!pincode) {
      return res.status(400).json({ error: 'Pincode is required' });
    }
    const result = await calculateShipping(pincode);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getMyOrders = async (req, res) => {
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
};

exports.getAllOrders = async (req, res) => {
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
};

exports.updateOrderStatus = async (req, res) => {
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
};

exports.createRazorpayOrder = async (req, res) => {
  try {
    const { amount, currency = 'INR', receipt } = req.body;

    if (!amount || amount < 100) {
      return res.status(400).json({ error: 'Amount is required and must be at least 100 paise' });
    }

    if (!receipt) {
      return res.status(400).json({ error: 'Receipt (order reference) is required' });
    }

    const options = {
      amount: parseInt(amount),
      currency,
      receipt: String(receipt)
    };

    const razorpayOrder = await razorpay.orders.create(options);

    res.status(201).json({
      order_id: razorpayOrder.id,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency
    });
  } catch (error) {
    console.error('Razorpay Create Order Error:', error);

    if (error.statusCode === 401 || (error.message && error.message.toLowerCase().includes('auth'))) {
      return res.status(401).json({ error: 'Razorpay authentication failed' });
    }

    res.status(500).json({ error: error.message || 'Failed to create Razorpay order' });
  }
};

exports.verifyPayment = async (req, res) => {
  try {
    const { razorpay_payment_id, razorpay_order_id, razorpay_signature, order_id, customer_email } = req.body;

    if (!razorpay_payment_id || !razorpay_order_id || !razorpay_signature || !order_id) {
      return res.status(400).json({ error: 'Missing required payment verification fields' });
    }

    const generated_signature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(razorpay_order_id + '|' + razorpay_payment_id)
      .digest('hex');

    if (generated_signature !== razorpay_signature) {
      console.warn(`Payment signature mismatch for Order ID: ${order_id}`);

      await supabase
        .from('orders')
        .update({ status: 'cancelled' })
        .eq('id', order_id);

      const { data: items } = await supabase
        .from('order_items')
        .select('product_id, quantity')
        .eq('order_id', order_id);

      if (items) {
        for (const item of items) {
          try {
            await supabase.rpc('restore_stock', { p_product_id: item.product_id, p_qty: item.quantity });
          } catch (stockErr) {
            console.error('Failed to restore stock on verification failure:', stockErr);
          }
        }
      }

      return res.status(400).json({ error: 'Payment verification failed: Signature mismatch' });
    }

    const { data: dbOrder, error: dbOrderErr } = await supabase
      .from('orders')
      .select('*')
      .eq('id', order_id)
      .single();

    if (dbOrderErr || !dbOrder) {
      return res.status(404).json({ error: 'Order not found' });
    }

    if (req.user && dbOrder.user_id && String(dbOrder.user_id) !== String(req.user.id)) {
      return res.status(403).json({ error: 'Forbidden' });
    }
    if (!req.user && dbOrder.customer_email && customer_email &&
        dbOrder.customer_email.toLowerCase() !== String(customer_email).toLowerCase()) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    try {
      const razorpayOrder = await razorpay.orders.fetch(razorpay_order_id);
      const expectedPaise = Math.round(dbOrder.total_amount * 100);
      if (razorpayOrder.amount !== expectedPaise) {
        console.warn(`Amount mismatch for Order ID ${order_id}: paid ${razorpayOrder.amount}, expected ${expectedPaise}`);
        await supabase.from('orders').update({ status: 'cancelled' }).eq('id', order_id);
        return res.status(400).json({ error: 'Payment verification failed: amount mismatch' });
      }
    } catch (fetchErr) {
      console.error('Failed to fetch Razorpay order for amount verification:', fetchErr);
      return res.status(502).json({ error: 'Unable to verify payment amount' });
    }

    // Update order status to 'order placed' upon successful verification
    await supabase.from('orders').update({ status: 'order placed' }).eq('id', order_id);

    // Send confirmation email in background with DB-sourced product details
    supabase
      .from('order_items')
      .select('product_id, quantity, price')
      .eq('order_id', order_id)
      .then(async ({ data: orderItems }) => {
        if (orderItems) {
          const emailItems = await fetchProductDetailsForEmail(orderItems);
          console.log(`Queueing payment verified email confirmation for Order ID: ${order_id} to ${dbOrder.customer_email}`);
          return sendOrderConfirmationEmail(
            dbOrder.customer_email,
            dbOrder.customer_name,
            order_id,
            dbOrder.total_amount,
            emailItems
          );
        }
      })
      .catch(emailErr => {
        console.error('Failed to send order confirmation email:', emailErr);
      });

    res.status(200).json({ success: true, message: 'Payment verified successfully' });
  } catch (error) {
    console.error('Razorpay Verify Payment Error:', error);
    res.status(500).json({ error: error.message || 'Payment verification failed' });
  }
};

exports.cancelStalePendingOrders = async (req, res) => {
  try {
    const thirtyMinsAgo = new Date(Date.now() - 30 * 60 * 1000).toISOString();
    const { data: staleOrders, error: fetchErr } = await supabase
      .from('orders')
      .select('id')
      .eq('status', 'pending')
      .lt('created_at', thirtyMinsAgo);

    if (fetchErr) throw fetchErr;

    let cancelledCount = 0;
    if (staleOrders && staleOrders.length > 0) {
      for (const order of staleOrders) {
        await supabase
          .from('orders')
          .update({ status: 'cancelled' })
          .eq('id', order.id);

        const { data: items } = await supabase
          .from('order_items')
          .select('product_id, quantity')
          .eq('order_id', order.id);

        if (items) {
          for (const item of items) {
            try {
              await supabase.rpc('restore_stock', { p_product_id: item.product_id, p_qty: item.quantity });
            } catch (stockErr) {
              console.error(`Failed to restore stock for stale order ${order.id}:`, stockErr);
            }
          }
        }
        cancelledCount++;
      }
    }

    res.json({ success: true, cancelledCount, message: `Cleaned up ${cancelledCount} stale pending order(s).` });
  } catch (error) {
    console.error('Cleanup stale orders error:', error);
    res.status(500).json({ error: error.message || 'Failed to cleanup stale orders' });
  }
};

exports.cancelOrder = async (req, res) => {
  try {
    const { order_id, customer_email } = req.body;
    if (!order_id) {
      return res.status(400).json({ error: 'Order ID is required' });
    }

    const { data: dbOrder, error: dbOrderErr } = await supabase
      .from('orders')
      .select('*')
      .eq('id', order_id)
      .single();

    if (dbOrderErr || !dbOrder) {
      return res.status(404).json({ error: 'Order not found' });
    }
    if (req.user) {
      if (String(dbOrder.user_id) !== String(req.user.id)) {
        return res.status(403).json({ error: 'Forbidden' });
      }
    } else {
      if (!customer_email || dbOrder.customer_email.toLowerCase() !== String(customer_email).toLowerCase()) {
        return res.status(403).json({ error: 'Forbidden' });
      }
    }
    if (dbOrder.status !== 'pending') {
      return res.status(400).json({ error: `Order cannot be cancelled (status: ${dbOrder.status})` });
    }

    await supabase
      .from('orders')
      .update({ status: 'cancelled' })
      .eq('id', order_id);

    const { data: items } = await supabase
      .from('order_items')
      .select('product_id, quantity')
      .eq('order_id', order_id);

    if (items) {
      for (const item of items) {
        try {
          await supabase.rpc('restore_stock', { p_product_id: item.product_id, p_qty: item.quantity });
        } catch (stockErr) {
          console.error('Failed to restore stock on cancel:', stockErr);
        }
      }
    }

    res.status(200).json({ success: true, message: 'Order cancelled and stock restored' });
  } catch (error) {
    console.error('Cancel Order Error:', error);
    res.status(500).json({ error: error.message || 'Failed to cancel order' });
  }
};

exports.createCodOrder = async (req, res) => {
  try {
    const { customer_name, customer_email, customer_address, zip, items } = req.body;

    if (!customer_name || !customer_email || !customer_address || !items || items.length === 0) {
      return res.status(400).json({ error: 'All order details and items are required' });
    }

    const user_id = req.user ? req.user.id : null;
    const { total_amount: items_amount, priceById } = await priceOrderItems(items);

    let shipping_charge = 0;
    if (zip) {
      const shippingInfo = await calculateShipping(zip);
      shipping_charge = shippingInfo.shipping_charge;
    }

    const grand_total = items_amount + shipping_charge;

    const { data: orderData, error: orderError } = await supabase
      .from('orders')
      .insert([{
        user_id,
        customer_name,
        customer_email,
        customer_address,
        total_amount: parseFloat(grand_total),
        shipping_charge: parseFloat(shipping_charge),
        status: 'order placed'
      }])
      .select();

    if (orderError) throw orderError;
    const newOrder = orderData[0];

    const orderItemsToInsert = items.map(item => ({
      order_id: newOrder.id,
      product_id: item.product_id,
      quantity: parseInt(item.quantity),
      price: priceById[item.product_id]
    }));

    const { error: itemsError } = await supabase
      .from('order_items')
      .insert(orderItemsToInsert);

    if (itemsError) {
      await supabase.from('orders').delete().eq('id', newOrder.id);
      throw itemsError;
    }

    try {
      await decrementStockAtomic(items);
    } catch (stockErr) {
      await supabase.from('orders').delete().eq('id', newOrder.id);
      throw stockErr;
    }

    supabase
      .from('order_items')
      .select('product_id, quantity, price')
      .eq('order_id', newOrder.id)
      .then(async ({ data: orderItems }) => {
        if (orderItems) {
          const emailItems = await fetchProductDetailsForEmail(orderItems);
          console.log(`Queueing COD email confirmation for Order ID: ${newOrder.id} to ${customer_email}`);
          return sendOrderConfirmationEmail(
            customer_email,
            customer_name,
            newOrder.id,
            newOrder.total_amount,
            emailItems
          );
        }
      })
      .catch(emailErr => {
        console.error('Failed to send COD order confirmation email:', emailErr);
      });

    res.status(201).json({
      message: 'COD order placed successfully',
      order: newOrder
    });
  } catch (error) {
    res.status(error.status || 500).json({ error: error.message });
  }
};

exports.getOrderDetails = async (req, res) => {
  try {
    const { id } = req.params;
    const { email } = req.query;

    const { data: order, error } = await supabase
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
      .eq('id', id)
      .single();

    if (error || !order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    // Check if requester is admin
    let isAdmin = false;
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      try {
        const jwt = require('jsonwebtoken');
        const payload = jwt.verify(token, process.env.ADMIN_JWT_SECRET);
        if (payload && payload.role === 'administrator') {
          isAdmin = true;
        }
      } catch (err) {
        // Ignore token error
      }
    }

    if (isAdmin) {
      return res.json(order);
    }

    if (order.user_id) {
      // Must match logged-in user
      if (!req.user || String(req.user.id) !== String(order.user_id)) {
        return res.status(403).json({ error: 'Forbidden: You do not have permission to view this order.' });
      }
    } else {
      // Guest order validation
      if (!email || email.toLowerCase() !== order.customer_email.toLowerCase()) {
        return res.status(403).json({ error: 'Forbidden: Email verification required to track guest orders.' });
      }
    }

    res.json(order);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
