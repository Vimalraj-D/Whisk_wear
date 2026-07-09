const supabase = require('./config/supabase');

async function run() {
  try {
    console.log('Querying latest order for relations...');
    const { data, error } = await supabase
      .from('orders')
      .select('*, order_items(id, quantity, price, products(id, name, image_urls))')
      .limit(1);
    
    if (error) {
      console.error('❌ Supabase select error:', error);
    } else {
      console.log('✅ Supabase select success:', JSON.stringify(data, null, 2));
    }
  } catch (err) {
    console.error('❌ Exception:', err);
  }
}

run();
