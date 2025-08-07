import fetch from 'node-fetch';

const BASE_URL = 'http://localhost:8000/api';

// Your items from the logs
const items = [
  {
    itemId: '68931440841ad05283f1f0bc',
    itemType: 'newArrival',
    quantity: 2,
    size: 'L',
    color: 'Red'
  },
  {
    itemId: '689324a1351aa3fb88aaa272',
    itemType: 'newArrival',
    quantity: 2,
    size: 'L',
    color: 'Red'
  },
  {
    itemId: '68932fa04c14a564a5b1fd19',
    itemType: 'newArrival',
    quantity: 2,
    size: 'L',
    color: 'Yellow'
  }
];

async function addAllItemsToCart() {
  try {
    console.log('🚀 Adding All Items to One Cart...\n');
    
    let sessionId = null;
    
    // Add all items with same session
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      console.log(`\n${i + 1}. Adding item ${i + 1}:`, {
        itemId: item.itemId,
        quantity: item.quantity,
        size: item.size,
        color: item.color
      });
      
      const response = await fetch(`${BASE_URL}/cart/add`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(sessionId && { 'X-Session-ID': sessionId })
        },
        body: JSON.stringify(item)
      });
      
      const result = await response.json();
      
      if (result.success) {
        sessionId = result.data.sessionId;
        console.log(`✅ Item ${i + 1} added successfully!`);
        console.log(`📊 Cart now has ${result.data.cart.items.length} unique items`);
        console.log(`📦 Total quantity: ${result.data.summary.totalItems}`);
        console.log(`🆔 Session ID: ${sessionId}`);
      } else {
        console.log(`❌ Failed to add item ${i + 1}:`, result.message);
      }
    }
    
    // Get final cart
    if (sessionId) {
      console.log('\n📋 Getting final cart...');
      const getResponse = await fetch(`${BASE_URL}/cart`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'X-Session-ID': sessionId
        }
      });
      
      const getResult = await getResponse.json();
      console.log('\n🎯 Final Cart Summary:');
      console.log('Total Items (quantity):', getResult.data.cart.totalItems);
      console.log('Unique Items:', getResult.data.cart.items.length);
      
      console.log('\n📦 Cart Items:');
      getResult.data.cart.items.forEach((item, index) => {
        console.log(`${index + 1}. ${item.title}`);
        console.log(`   - Item ID: ${item.itemId}`);
        console.log(`   - Quantity: ${item.quantity}`);
        console.log(`   - Size: ${item.size}, Color: ${item.color}`);
        console.log(`   - Price: $${item.price} (Original: $${item.originalPrice})`);
        console.log('');
      });
      
      console.log('💰 Cart Totals:');
      console.log(`Subtotal: $${getResult.data.summary.subtotal}`);
      console.log(`Discount: $${getResult.data.summary.totalDiscount}`);
      console.log(`Total: $${getResult.data.summary.totalAmount}`);
      
      console.log('\n🔑 Your Session ID for future requests:');
      console.log(`X-Session-ID: ${sessionId}`);
    }
    
  } catch (error) {
    console.error('❌ Error adding items to cart:', error);
  }
}

// Run the test
addAllItemsToCart(); 