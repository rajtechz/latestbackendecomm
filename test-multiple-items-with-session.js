import fetch from 'node-fetch';

const BASE_URL = 'http://localhost:8000/api';
const SESSION_ID = '52331f9d-a35e-4fdb-bbd6-f0c182e57dc0'; // User's session ID

// Test data - different items
const testItems = [
  {
    itemId: '689330504c14a564a5b1fda6',
    itemType: 'newArrival',
    quantity: 1,
    size: 'L',
    color: 'Blue'
  },
  {
    itemId: '689330504c14a564a5b1fda6', // Same product, different size
    itemType: 'newArrival',
    quantity: 1,
    size: 'M',
    color: 'Blue'
  },
  {
    itemId: '689330504c14a564a5b1fda6', // Same product, different color
    itemType: 'newArrival',
    quantity: 1,
    size: 'L',
    color: 'Red'
  },
  {
    itemId: '689334790295501eb1f846ec', // Different product
    itemType: 'newArrival',
    quantity: 1,
    size: 'L',
    color: 'Blue'
  }
];

async function testMultipleItemsWithSession() {
  try {
    console.log('🚀 Testing Multiple Items with Existing Session...\n');
    
    // Add multiple different items
    for (let i = 0; i < testItems.length; i++) {
      const item = testItems[i];
      console.log(`\n${i + 1}. Adding item ${i + 1}:`, {
        itemId: item.itemId,
        size: item.size,
        color: item.color
      });
      
      const response = await fetch(`${BASE_URL}/cart/add`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Session-ID': SESSION_ID
        },
        body: JSON.stringify(item)
      });
      
      const result = await response.json();
      
      if (result.success) {
        console.log(`✅ Item ${i + 1} added successfully!`);
        console.log(`📊 Cart now has ${result.data.cart.items.length} unique items`);
        console.log(`📦 Total quantity: ${result.data.summary.totalItems}`);
      } else {
        console.log(`❌ Failed to add item ${i + 1}:`, result.message);
      }
    }
    
    // Get final cart
    console.log('\n📋 Getting final cart...');
    const getResponse = await fetch(`${BASE_URL}/cart`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'X-Session-ID': SESSION_ID
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
    
  } catch (error) {
    console.error('❌ Error testing multiple items:', error);
  }
}

// Run the test
testMultipleItemsWithSession(); 