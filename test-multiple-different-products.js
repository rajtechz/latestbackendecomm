import fetch from 'node-fetch';

const BASE_URL = 'http://localhost:8000/api';

// Test data - different product IDs (replace with actual IDs from your database)
const testItems = [
  {
    itemId: '6893439c6071f5f233e265c9',
    itemType: 'newArrival',
    quantity: 1,
    size: 'M',
    color: 'Yellow'
  },
  {
    itemId: '68931440841ad05283f1f0bc', // Different product ID
    itemType: 'newArrival',
    quantity: 1,
    size: 'L',
    color: 'Red'
  },
  {
    itemId: '689334790295501eb1f846ec', // Different product ID
    itemType: 'newArrival',
    quantity: 1,
    size: 'S',
    color: 'Blue'
  }
];

async function testMultipleDifferentProducts() {
  try {
    console.log('🚀 Testing Multiple Different Products in Cart...\n');
    
    let sessionId = null;
    
    // Add multiple different items
    for (let i = 0; i < testItems.length; i++) {
      const item = testItems[i];
      console.log(`\n${i + 1}. Adding different product ${i + 1}:`, {
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
        console.log(`✅ Product ${i + 1} added successfully!`);
        console.log(`📊 Cart now has ${result.data.cart.items.length} unique items`);
        console.log(`📦 Total quantity: ${result.data.summary.totalItems}`);
      } else {
        console.log(`❌ Failed to add product ${i + 1}:`, result.message);
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
    }
    
  } catch (error) {
    console.error('❌ Error testing multiple different products:', error);
  }
}

// Run the test
testMultipleDifferentProducts(); 