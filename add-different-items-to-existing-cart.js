import fetch from 'node-fetch';

const BASE_URL = 'http://localhost:8000/api';
const EXISTING_SESSION_ID = '7b3b7a3e-44f2-4578-a918-0ead6a7b181a'; // Your existing session ID

// Different items to add to your existing cart
const differentItems = [
  {
    itemId: '68931440841ad05283f1f0bc', // Different product
    itemType: 'newArrival',
    quantity: 1,
    size: 'M',
    color: 'Red'
  },
  {
    itemId: '689324a1351aa3fb88aaa272', // Different product
    itemType: 'newArrival',
    quantity: 1,
    size: 'S',
    color: 'Blue'
  },
  {
    itemId: '68932fa04c14a564a5b1fd19', // Same product, different size
    itemType: 'newArrival',
    quantity: 1,
    size: 'M', // Different size
    color: 'Yellow'
  }
];

async function addDifferentItemsToExistingCart() {
  try {
    console.log('🚀 Adding Different Items to Your Existing Cart...\n');
    console.log(`📋 Using Session ID: ${EXISTING_SESSION_ID}\n`);
    
    // Add different items to existing cart
    for (let i = 0; i < differentItems.length; i++) {
      const item = differentItems[i];
      console.log(`\n${i + 1}. Adding different item ${i + 1}:`, {
        itemId: item.itemId,
        quantity: item.quantity,
        size: item.size,
        color: item.color
      });
      
      const response = await fetch(`${BASE_URL}/cart/add`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Session-ID': EXISTING_SESSION_ID
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
        'X-Session-ID': EXISTING_SESSION_ID
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
    console.error('❌ Error adding different items:', error);
  }
}

// Run the script
addDifferentItemsToExistingCart(); 