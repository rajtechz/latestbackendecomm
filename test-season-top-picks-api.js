import fetch from 'node-fetch';

const BASE_URL = 'http://localhost:8000/api';

// Test data for season top picks
const testSeasonTopPick = {
  title: "Solid Stretch Cotton Blend Shirt | Blue",
  description: "Premium quality cotton blend shirt with stretch comfort. Perfect for casual and semi-formal occasions.",
  currentPrice: 1799,
  originalPrice: 2999,
  brand: "Monster Brand",
  color: "Blue",
  material: "Cotton Blend",
  season: "Summer",
  category: "Shirts",
  subcategory: "Casual Shirts",
  priority: 8,
  displayOrder: 1,
  isActive: true,
  isFeatured: true,
  labels: ["EXCLUSIVE", "TRENDING"],
  availableSizes: [
    { size: "S", stock: 10, isAvailable: true },
    { size: "M", stock: 15, isAvailable: true },
    { size: "L", stock: 12, isAvailable: true },
    { size: "XL", stock: 8, isAvailable: true }
  ],
  rating: 4.5,
  numReviews: 25,
  tags: ["casual", "comfortable", "trending"],
  keywords: ["cotton", "shirt", "casual", "summer"]
};

// Admin token (you'll need to get this from login)
const ADMIN_TOKEN = 'your-admin-token-here';

async function testSeasonTopPicksAPI() {
  try {
    console.log('🚀 Testing Season Top Picks API...\n');
    
    // Test 1: Create Season Top Pick (Admin)
    console.log('1️⃣ Creating Season Top Pick...');
    const createResponse = await fetch(`${BASE_URL}/products/season-top-picks/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${ADMIN_TOKEN}`
      },
      body: JSON.stringify(testSeasonTopPick)
    });
    
    const createResult = await createResponse.json();
    
    if (createResult.success) {
      console.log('✅ Season Top Pick created successfully!');
      console.log('📋 Created ID:', createResult.data._id);
      
      const seasonTopPickId = createResult.data._id;
      
      // Test 2: Get All Season Top Picks (Admin)
      console.log('\n2️⃣ Getting All Season Top Picks (Admin)...');
      const getAllResponse = await fetch(`${BASE_URL}/products/season-top-picks/admin/all`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${ADMIN_TOKEN}`
        }
      });
      
      const getAllResult = await getAllResponse.json();
      
      if (getAllResult.success) {
        console.log('✅ Retrieved all season top picks');
        console.log('📊 Total count:', getAllResult.data.length);
      } else {
        console.log('❌ Failed to get all season top picks:', getAllResult.message);
      }
      
      // Test 3: Get Single Season Top Pick (Admin)
      console.log('\n3️⃣ Getting Single Season Top Pick (Admin)...');
      const getSingleResponse = await fetch(`${BASE_URL}/products/season-top-picks/admin/${seasonTopPickId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${ADMIN_TOKEN}`
        }
      });
      
      const getSingleResult = await getSingleResponse.json();
      
      if (getSingleResult.success) {
        console.log('✅ Retrieved single season top pick');
        console.log('📋 Title:', getSingleResult.data.title);
        console.log('💰 Price:', getSingleResult.data.currentPrice);
      } else {
        console.log('❌ Failed to get single season top pick:', getSingleResult.message);
      }
      
      // Test 4: Update Season Top Pick (Admin)
      console.log('\n4️⃣ Updating Season Top Pick (Admin)...');
      const updateData = {
        title: "Updated Solid Stretch Cotton Blend Shirt | Blue",
        currentPrice: 1699,
        priority: 9
      };
      
      const updateResponse = await fetch(`${BASE_URL}/products/season-top-picks/admin/${seasonTopPickId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${ADMIN_TOKEN}`
        },
        body: JSON.stringify(updateData)
      });
      
      const updateResult = await updateResponse.json();
      
      if (updateResult.success) {
        console.log('✅ Season Top Pick updated successfully!');
        console.log('📋 Updated title:', updateResult.data.title);
        console.log('💰 Updated price:', updateResult.data.currentPrice);
      } else {
        console.log('❌ Failed to update season top pick:', updateResult.message);
      }
      
      // Test 5: Get Public Season Top Picks (No Auth)
      console.log('\n5️⃣ Getting Public Season Top Picks...');
      const getPublicResponse = await fetch(`${BASE_URL}/products/season-top-picks/public/all`);
      
      const getPublicResult = await getPublicResponse.json();
      
      if (getPublicResult.success) {
        console.log('✅ Retrieved public season top picks');
        console.log('📊 Total count:', getPublicResult.data.length);
      } else {
        console.log('❌ Failed to get public season top picks:', getPublicResult.message);
      }
      
      // Test 6: Get Featured Season Top Picks (No Auth)
      console.log('\n6️⃣ Getting Featured Season Top Picks...');
      const getFeaturedResponse = await fetch(`${BASE_URL}/products/season-top-picks/public/featured`);
      
      const getFeaturedResult = await getFeaturedResponse.json();
      
      if (getFeaturedResult.success) {
        console.log('✅ Retrieved featured season top picks');
        console.log('📊 Featured count:', getFeaturedResult.data.length);
      } else {
        console.log('❌ Failed to get featured season top picks:', getFeaturedResult.message);
      }
      
      // Test 7: Get Season Top Picks by Category (No Auth)
      console.log('\n7️⃣ Getting Season Top Picks by Category...');
      const getByCategoryResponse = await fetch(`${BASE_URL}/products/season-top-picks/public/category/Shirts`);
      
      const getByCategoryResult = await getByCategoryResponse.json();
      
      if (getByCategoryResult.success) {
        console.log('✅ Retrieved season top picks by category');
        console.log('📊 Category count:', getByCategoryResult.data.length);
        console.log('🏷️ Category:', getByCategoryResult.category);
      } else {
        console.log('❌ Failed to get season top picks by category:', getByCategoryResult.message);
      }
      
      // Test 8: Get Single Season Top Pick (Public)
      console.log('\n8️⃣ Getting Single Season Top Pick (Public)...');
      const getSinglePublicResponse = await fetch(`${BASE_URL}/products/season-top-picks/public/${seasonTopPickId}`);
      
      const getSinglePublicResult = await getSinglePublicResponse.json();
      
      if (getSinglePublicResult.success) {
        console.log('✅ Retrieved single season top pick (public)');
        console.log('📋 Title:', getSinglePublicResult.data.title);
      } else {
        console.log('❌ Failed to get single season top pick (public):', getSinglePublicResult.message);
      }
      
      // Test 9: Increment Impression (Public)
      console.log('\n9️⃣ Incrementing Impression...');
      const impressionResponse = await fetch(`${BASE_URL}/products/season-top-picks/${seasonTopPickId}/impression`, {
        method: 'POST'
      });
      
      const impressionResult = await impressionResponse.json();
      
      if (impressionResult.success) {
        console.log('✅ Impression incremented successfully!');
      } else {
        console.log('❌ Failed to increment impression:', impressionResult.message);
      }
      
      // Test 10: Increment Click (Public)
      console.log('\n🔟 Incrementing Click...');
      const clickResponse = await fetch(`${BASE_URL}/products/season-top-picks/${seasonTopPickId}/click`, {
        method: 'POST'
      });
      
      const clickResult = await clickResponse.json();
      
      if (clickResult.success) {
        console.log('✅ Click incremented successfully!');
      } else {
        console.log('❌ Failed to increment click:', clickResult.message);
      }
      
      // Test 11: Get Statistics (Admin)
      console.log('\n1️⃣1️⃣ Getting Statistics (Admin)...');
      const statsResponse = await fetch(`${BASE_URL}/products/season-top-picks/admin/stats`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${ADMIN_TOKEN}`
        }
      });
      
      const statsResult = await statsResponse.json();
      
      if (statsResult.success) {
        console.log('✅ Retrieved statistics');
        console.log('📊 Total season top picks:', statsResult.data.total);
        console.log('✅ Active season top picks:', statsResult.data.active);
        console.log('⭐ Featured season top picks:', statsResult.data.featured);
      } else {
        console.log('❌ Failed to get statistics:', statsResult.message);
      }
      
      // Test 12: Delete Season Top Pick (Admin)
      console.log('\n1️⃣2️⃣ Deleting Season Top Pick (Admin)...');
      const deleteResponse = await fetch(`${BASE_URL}/products/season-top-picks/admin/${seasonTopPickId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${ADMIN_TOKEN}`
        }
      });
      
      const deleteResult = await deleteResponse.json();
      
      if (deleteResult.success) {
        console.log('✅ Season Top Pick deleted successfully!');
      } else {
        console.log('❌ Failed to delete season top pick:', deleteResult.message);
      }
      
    } else {
      console.log('❌ Failed to create season top pick:', createResult.message);
    }
    
  } catch (error) {
    console.error('❌ Error testing season top picks API:', error);
  }
}

// Run the test
testSeasonTopPicksAPI(); 