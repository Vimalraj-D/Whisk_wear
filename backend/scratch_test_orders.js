const supabase = require('./config/supabase');

async function run() {
  try {
    const { data: orders, error } = await supabase
      .from('orders')
      .select('id, user_id, customer_name, customer_email, total_amount, status, created_at')
      .order('id', { ascending: false });
    
    if (error) {
      console.error('❌ orders select error:', error);
      return;
    }
    
    console.log('Orders found:', orders.length);
    console.log('Latest 5 orders:', orders.slice(0, 5));
  } catch (err) {
    console.error('❌ Exception:', err);
  }
}

run();
