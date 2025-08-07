import fetch from 'node-fetch';

const BASE_URL = 'http://localhost:8000/api';

// Your existing cart session IDs
const existingCarts = [
  '2dbce7dd-3eb9-4f1e-a4c4-7eb64e9ec3ca',
  'ac86650f-f2cc-4642-9410-c447ef9c35c1',
  '7b3b7a3e-44f2-4578-a918-0ead6a7b181a'
];

async function combineAllCarts() {
  try {
    console.log('🔄 Combining all carts into one...\n');
    
    let newSessionId = null;
    let allItems = [];
    
    // Get items from all existing carts
    for (let i = 0; i < existingCarts.length; i++) {
      const sessionId = existingCarts[i];
      console.log(`\n📋 Getting items from Cart ${i + 1} (${sessionId})...`);
      
      const response = await fetch(`${BASE_URL}/cart`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'X-Session-ID': sessionId
        }
      });
      
      const result = await response.json();
      
      if (result.success && result.data.cart.items.length > 0) {
        console.log(`✅ Found ${result.data.cart.items.length} items in Cart ${i + 1}`);
        allItems = allItems.concat(result.data.cart.items);
      } else {
        console.log(`❌ No items found in Cart ${i + 1}`);
      }
    }
    
    console.log(`\n📦 Total items to combine: ${allItems.length}`);
    
    if (allItems.length === 0) {
      console.log('❌ No items found in any cart');
      return;
    }
    
    // Create a new cart and add all items
    console.log('\n🛒 Creating new combined cart...');
    
    for (let i = 0; i < allItems.length; i++) {
      const item = allItems[i];
      console.log(`\n${i + 1}. Adding item: ${item.title}`);
      
      const addResponse = await fetch(`${BASE_URL}/cart/add`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(newSessionId && { 'X-Session-ID': newSessionId })
        },
        body: JSON.stringify({
          itemId: item.itemId,
          itemType: item.itemType,
          quantity: item.quantity,
          size: item.size,
          color: item.color
        })
      });
      
      const addResult = await addResponse.json();
      
      if (addResult.success) {
        newSessionId = addResult.data.sessionId;
        console.log(`✅ Item added successfully!`);
        console.log(`📊 Cart now has ${addResult.data.cart.items.length} unique items`);
      } else {
        console.log(`❌ Failed to add item: ${addResult.message}`);
      }
    }
    
    // Get final combined cart
    if (newSessionId) {
      console.log('\n📋 Getting final combined cart...');
      const getResponse = await fetch(`${BASE_URL}/cart`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'X-Session-ID': newSessionId
        }
      });
      
      const getResult = await getResponse.json();
      console.log('\n🎯 Combined Cart Summary:');
      console.log('Total Items (quantity):', getResult.data.cart.totalItems);
      console.log('Unique Items:', getResult.data.cart.items.length);
      
      console.log('\n📦 Combined Cart Items:');
      getResult.data.cart.items.forEach((item, index) => {
        console.log(`${index + 1}. ${item.title}`);
        console.log(`   - Item ID: ${item.itemId}`);
        console.log(`   - Quantity: ${item.quantity}`);
        console.log(`   - Size: ${item.size}, Color: ${item.color}`);
        console.log(`   - Price: $${item.price} (Original: $${item.originalPrice})`);
        console.log('');
      });
      
      console.log('💰 Combined Cart Totals:');
      console.log(`Subtotal: $${getResult.data.summary.subtotal}`);
      console.log(`Discount: $${getResult.data.summary.totalDiscount}`);
      console.log(`Total: $${getResult.data.summary.totalAmount}`);
      
      console.log('\n🔑 Your New Combined Cart Session ID:');
      console.log(`X-Session-ID: ${newSessionId}`);
    }
    
  } catch (error) {
    console.error('❌ Error combining carts:', error);
  }
}

// Run the script
combineAllCarts(); 