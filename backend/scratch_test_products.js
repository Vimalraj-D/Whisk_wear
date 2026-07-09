const supabase = require('./config/supabase');

async function run() {
  try {
    const { data: items, error } = await supabase
      .from('order_items')
      .select('id, order_id, product_id, price, quantity');
    
    if (error) {
      console.error('❌ order_items select error:', error);
      return;
    }
    
    console.log('order_items:', items);
    
    for (const item of items) {
      if (item.product_id) {
        const { data: prod, error: prodErr } = await supabase
          .from('products')
          .select('id, name')
          .eq('id', item.product_id)
          .single();
        console.log(`Product ID ${item.product_id} lookup:`, prod, prodErr ? prodErr.message : '');
      } else {
        console.log(`Item ID ${item.id} has no product_id`);
      }
    }
  } catch (err) {
    console.error('❌ Exception:', err);
  }
}

run();
