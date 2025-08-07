import fetch from 'node-fetch';

const BASE_URL = 'http://localhost:8000/api';

async function findMyCarts() {
  try {
    console.log('🔍 Finding all your carts...\n');
    
    // Get all carts
    const response = await fetch(`${BASE_URL}/cart/debug/all`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    const result = await response.json();
    
    if (result.success) {
      console.log(`📋 Found ${result.data.totalCarts} active carts:\n`);
      
      result.data.carts.forEach((cart, index) => {
        console.log(`🛒 Cart ${index + 1}:`);
        console.log(`   Session ID: ${cart.sessionId}`);
        console.log(`   Items: ${cart.itemCount}`);
        console.log(`   Total Quantity: ${cart.totalItems}`);
        console.log(`   Total Amount: $${cart.totalAmount}`);
        console.log(`   Created: ${new Date(cart.createdAt).toLocaleString()}`);
        
        if (cart.items.length > 0) {
          console.log('   📦 Items:');
          cart.items.forEach((item, itemIndex) => {
            console.log(`      ${itemIndex + 1}. ${item.title}`);
            console.log(`         - Quantity: ${item.quantity}`);
            console.log(`         - Size: ${item.size}, Color: ${item.color}`);
          });
        }
        console.log('');
      });
      
      // Show how to use a specific cart
      if (result.data.carts.length > 0) {
        const firstCart = result.data.carts[0];
        console.log('🎯 To get items from a specific cart, use:');
        console.log(`GET ${BASE_URL}/cart`);
        console.log('Headers:');
        console.log(`X-Session-ID: ${firstCart.sessionId}`);
        console.log('');
        
        console.log('📝 Example with curl:');
        console.log(`curl -X GET "${BASE_URL}/cart" \\`);
        console.log(`  -H "Content-Type: application/json" \\`);
        console.log(`  -H "X-Session-ID: ${firstCart.sessionId}"`);
      }
      
    } else {
      console.log('❌ Failed to get carts:', result.message);
    }
    
  } catch (error) {
    console.error('❌ Error finding carts:', error);
  }
}

// Run the script
findMyCarts(); 