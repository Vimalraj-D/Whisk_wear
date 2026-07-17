const express = require('express');
const router = express.Router();
const supabase = require('../config/supabase');
const adminAuth = require('../middleware/adminAuth');
const userAuth = require('../middleware/userAuth');
const optionalUserAuth = require('../middleware/optionalUserAuth');
const crypto = require('crypto');

// Recomputes order totals from the DB (never trusts client-supplied prices),
// validates stock, and returns { total_amount, priceById } or throws.
async function priceOrderItems(supabase, items) {
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

  let total_amount = 0;
  for (const item of items) {
    const unitPrice = priceById[item.product_id];
    if (unitPrice === undefined) {
      throw Object.assign(new Error(`Product ${item.product_id} not found`), { status: 400 });
    }
    const qty = parseInt(item.quantity);
    if (!qty || qty <= 0) {
      throw Object.assign(new Error('Invalid quantity'), { status: 400 });
    }
    if (stockById[item.product_id] !== undefined && qty > stockById[item.product_id]) {
      throw Object.assign(new Error(`Insufficient stock for product ${item.product_id}`), { status: 400 });
    }
    total_amount += unitPrice * qty;
  }

  return { total_amount: Math.round(total_amount * 100) / 100, priceById };
}
const Razorpay = require('razorpay');
const { sendOrderConfirmationEmail } = require('../services/emailService');

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});


// Create a new order (Checkout)
router.post('/', optionalUserAuth, async (req, res) => {
  try {
    const { customer_name, customer_email, customer_address, items } = req.body;
    
    if (!customer_name || !customer_email || !customer_address || !items || items.length === 0) {
      return res.status(400).json({ error: 'All order details and items are required' });
    }

    // user_id (if any) now comes only from a verified JWT — never from client input
    const user_id = req.user ? req.user.id : null;

    // Price/stock are recalculated server-side from the products table;
    // client-supplied `item.price` is ignored to prevent price tampering.
    const { total_amount, priceById } = await priceOrderItems(supabase, items);
    
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
    
    // Prepare order items using server-verified prices
    const orderItemsToInsert = items.map(item => ({
      order_id: newOrder.id,
      product_id: item.product_id,
      quantity: parseInt(item.quantity),
      price: priceById[item.product_id]
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
    res.status(error.status || 500).json({ error: error.message });
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

// Razorpay: Create Order
router.post('/create-order', async (req, res) => {
  try {
    const { amount, currency = 'INR', receipt } = req.body;

    // Validate amount (paise) >= 100
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
    
    // Handle auth failures
    if (error.statusCode === 401 || (error.message && error.message.toLowerCase().includes('auth'))) {
      return res.status(401).json({ error: 'Razorpay authentication failed' });
    }
    
    res.status(500).json({ error: error.message || 'Failed to create Razorpay order' });
  }
});

// Razorpay: Verify Payment Signature
router.post('/verify-payment', optionalUserAuth, async (req, res) => {
  try {
    const { razorpay_payment_id, razorpay_order_id, razorpay_signature, order_id, customer_email } = req.body;

    // Validate missing fields
    if (!razorpay_payment_id || !razorpay_order_id || !razorpay_signature || !order_id) {
      return res.status(400).json({ error: 'Missing required payment verification fields' });
    }

    // Verify signature
    const generated_signature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(razorpay_order_id + '|' + razorpay_payment_id)
      .digest('hex');

    if (generated_signature !== razorpay_signature) {
      console.warn(`Payment signature mismatch for Order ID: ${order_id}`);
      
      // Update order status to 'cancelled' on signature mismatch
      await supabase
        .from('orders')
        .update({ status: 'cancelled' })
        .eq('id', order_id);

      // Restore stock levels
      const { data: items } = await supabase
        .from('order_items')
        .select('product_id, quantity')
        .eq('order_id', order_id);

      if (items) {
        for (const item of items) {
          try {
            const { data: prodData } = await supabase.from('products').select('stock, sales_count').eq('id', item.product_id).single();
            if (prodData) {
              const newStock = prodData.stock + item.quantity;
              const newSales = Math.max(0, (prodData.sales_count || 0) - item.quantity);
              await supabase.from('products').update({ stock: newStock, sales_count: newSales }).eq('id', item.product_id);
            }
          } catch (stockErr) {
            console.error('Failed to restore stock on verification failure:', stockErr);
          }
        }
      }

      return res.status(400).json({ error: 'Payment verification failed: Signature mismatch' });
    }

    // Fetch the order and confirm ownership before trusting order_id
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

    // Critical: confirm the amount actually paid on Razorpay matches what
    // this order is supposed to cost. Without this check, an attacker could
    // pay for a cheap Razorpay order and apply the signature to a much more
    // expensive internal order_id (amount-substitution fraud).
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

    // Signature and amount verified — payment confirmed

    // Send confirmation email in background (truly fire and forget)
    supabase
      .from('orders')
      .select('*, order_items(id, quantity, price, products(id, name, image_urls))')
      .eq('id', order_id)
      .single()
      .then(({ data: orderData }) => {
        if (orderData) {
          const emailItems = (orderData.order_items || []).map(oi => ({
            name: oi.products?.name || 'Product',
            quantity: oi.quantity,
            price: oi.price,
            image_url: oi.products?.image_urls?.[0] || ''
          }));
          console.log(`Queueing payment verified email confirmation for Order ID: ${orderData.id} to ${orderData.customer_email}`);
          return sendOrderConfirmationEmail(
            orderData.customer_email,
            orderData.customer_name,
            orderData.id,
            orderData.total_amount,
            emailItems
          ).then(() => {
            console.log(`Payment verified email sent successfully for Order ID: ${orderData.id}`);
          });
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
});

// Razorpay: Cancel Order
router.post('/cancel-order', optionalUserAuth, async (req, res) => {
  try {
    const { order_id, customer_email } = req.body;
    if (!order_id) {
      return res.status(400).json({ error: 'Order ID is required' });
    }

    // Ownership check: fetch the order first and confirm the requester
    // either owns it (logged-in) or supplied the matching guest email.
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
    // Only pending orders can be cancelled this way
    if (dbOrder.status !== 'pending') {
      return res.status(400).json({ error: `Order cannot be cancelled (status: ${dbOrder.status})` });
    }

    // Update order status to 'cancelled'
    await supabase
      .from('orders')
      .update({ status: 'cancelled' })
      .eq('id', order_id);

    // Restore stock levels
    const { data: items } = await supabase
      .from('order_items')
      .select('product_id, quantity')
      .eq('order_id', order_id);

    if (items) {
      for (const item of items) {
        try {
          const { data: prodData } = await supabase.from('products').select('stock, sales_count').eq('id', item.product_id).single();
          if (prodData) {
            const newStock = prodData.stock + item.quantity;
            const newSales = Math.max(0, (prodData.sales_count || 0) - item.quantity);
            await supabase.from('products').update({ stock: newStock, sales_count: newSales }).eq('id', item.product_id);
          }
        } catch (stockErr) {
          console.error('Failed to restore stock on cancel:', stockErr);
        }
      }
    }

    res.status(200).json({ success: true, message: 'Order cancelled and stock restored' });
  } catch (error) {
    console.error('Razorpay Cancel Order Error:', error);
    res.status(500).json({ error: error.message || 'Failed to cancel order' });
  }
});

// COD: Place order with Cash on Delivery
router.post('/cod-order', optionalUserAuth, async (req, res) => {
  try {
    const { customer_name, customer_email, customer_address, items } = req.body;

    if (!customer_name || !customer_email || !customer_address || !items || items.length === 0) {
      return res.status(400).json({ error: 'All order details and items are required' });
    }

    // user_id (if any) now comes only from a verified JWT — never from client input
    const user_id = req.user ? req.user.id : null;

    // Price/stock are recalculated server-side from the products table;
    // client-supplied `item.price` is ignored to prevent price tampering.
    const { total_amount, priceById } = await priceOrderItems(supabase, items);

    // Insert order with pending status (COD)
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

    // Insert order items using server-verified prices
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

    // Update product stock levels and sales count
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

    // Send confirmation email (in the background, non-blocking)
    const emailItems = items.map(item => ({
      name: item.name || 'Product',
      quantity: item.quantity,
      price: priceById[item.product_id],
      image_url: item.image_url || ''
    }));
    console.log(`Queueing COD email confirmation for Order ID: ${newOrder.id} to ${customer_email}`);
    sendOrderConfirmationEmail(
      customer_email,
      customer_name,
      newOrder.id,
      total_amount,
      emailItems
    ).then(() => {
      console.log(`COD email sent successfully for Order ID: ${newOrder.id}`);
    }).catch(emailErr => {
      console.error('Failed to send COD order confirmation email:', emailErr);
    });

    res.status(201).json({
      message: 'COD order placed successfully',
      order: newOrder
    });
  } catch (error) {
    res.status(error.status || 500).json({ error: error.message });
  }
});

module.exports = router;