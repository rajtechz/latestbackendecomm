import fetch from 'node-fetch';

const BASE_URL = 'http://localhost:8000/api';

// Test data for trending category
const testTrendingCategory = {
  name: "OVERSIZED T-SHIRTS",
  slug: "oversized-t-shirts",
  description: "Comfortable and stylish oversized t-shirts for casual wear",
  targetUrl: "/category/oversized-t-shirts",
  categoryType: "fashion",
  displayOrder: 1,
  isActive: true,
  isFeatured: true,
  tags: "casual,oversized,comfortable",
  keywords: "oversized t-shirts, casual wear, comfortable clothing"
};

// Placeholder for admin token (replace with actual token)
const ADMIN_TOKEN = 'your-admin-token-here';

async function testTrendingCategoriesAPI() {
  console.log('🚀 Testing Trending Categories API...\n');

  try {
    // Test 1: Create Trending Category (Admin)
    console.log('1. Testing CREATE Trending Category (Admin)...');
    const createResponse = await fetch(`${BASE_URL}/products/trending-categories/create`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${ADMIN_TOKEN}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(testTrendingCategory)
    });

    if (createResponse.ok) {
      const createData = await createResponse.json();
      console.log('✅ CREATE successful:', createData.message);
      const categoryId = createData.data._id;
      
      // Test 2: Get All Trending Categories (Admin)
      console.log('\n2. Testing GET All Trending Categories (Admin)...');
      const getAllResponse = await fetch(`${BASE_URL}/products/trending-categories/admin/all`, {
        headers: {
          'Authorization': `Bearer ${ADMIN_TOKEN}`
        }
      });

      if (getAllResponse.ok) {
        const getAllData = await getAllResponse.json();
        console.log('✅ GET All successful:', getAllData.data.length, 'categories found');
      } else {
        console.log('❌ GET All failed:', getAllResponse.status);
      }

      // Test 3: Get Single Trending Category (Admin)
      console.log('\n3. Testing GET Single Trending Category (Admin)...');
      const getSingleResponse = await fetch(`${BASE_URL}/products/trending-categories/admin/${categoryId}`, {
        headers: {
          'Authorization': `Bearer ${ADMIN_TOKEN}`
        }
      });

      if (getSingleResponse.ok) {
        const getSingleData = await getSingleResponse.json();
        console.log('✅ GET Single successful:', getSingleData.data.name);
      } else {
        console.log('❌ GET Single failed:', getSingleResponse.status);
      }

      // Test 4: Update Trending Category (Admin)
      console.log('\n4. Testing UPDATE Trending Category (Admin)...');
      const updateData = {
        ...testTrendingCategory,
        name: "Updated OVERSIZED T-SHIRTS",
        description: "Updated description for oversized t-shirts"
      };

      const updateResponse = await fetch(`${BASE_URL}/products/trending-categories/admin/${categoryId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${ADMIN_TOKEN}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updateData)
      });

      if (updateResponse.ok) {
        const updateResult = await updateResponse.json();
        console.log('✅ UPDATE successful:', updateResult.message);
      } else {
        console.log('❌ UPDATE failed:', updateResponse.status);
      }

      // Test 5: Get Public Trending Categories
      console.log('\n5. Testing GET Public Trending Categories...');
      const getPublicResponse = await fetch(`${BASE_URL}/products/trending-categories/public/all`);

      if (getPublicResponse.ok) {
        const getPublicData = await getPublicResponse.json();
        console.log('✅ GET Public successful:', getPublicData.data.length, 'categories found');
      } else {
        console.log('❌ GET Public failed:', getPublicResponse.status);
      }

      // Test 6: Get Active Trending Categories
      console.log('\n6. Testing GET Active Trending Categories...');
      const getActiveResponse = await fetch(`${BASE_URL}/products/trending-categories/public/active`);

      if (getActiveResponse.ok) {
        const getActiveData = await getActiveResponse.json();
        console.log('✅ GET Active successful:', getActiveData.data.length, 'active categories');
      } else {
        console.log('❌ GET Active failed:', getActiveResponse.status);
      }

      // Test 7: Get Featured Trending Categories
      console.log('\n7. Testing GET Featured Trending Categories...');
      const getFeaturedResponse = await fetch(`${BASE_URL}/products/trending-categories/public/featured`);

      if (getFeaturedResponse.ok) {
        const getFeaturedData = await getFeaturedResponse.json();
        console.log('✅ GET Featured successful:', getFeaturedData.data.length, 'featured categories');
      } else {
        console.log('❌ GET Featured failed:', getFeaturedResponse.status);
      }

      // Test 8: Get Trending Categories by Type
      console.log('\n8. Testing GET Trending Categories by Type...');
      const getByTypeResponse = await fetch(`${BASE_URL}/products/trending-categories/public/type/fashion`);

      if (getByTypeResponse.ok) {
        const getByTypeData = await getByTypeResponse.json();
        console.log('✅ GET By Type successful:', getByTypeData.data.length, 'fashion categories');
      } else {
        console.log('❌ GET By Type failed:', getByTypeResponse.status);
      }

      // Test 9: Get Single Public Trending Category
      console.log('\n9. Testing GET Single Public Trending Category...');
      const getSinglePublicResponse = await fetch(`${BASE_URL}/products/trending-categories/public/${categoryId}`);

      if (getSinglePublicResponse.ok) {
        const getSinglePublicData = await getSinglePublicResponse.json();
        console.log('✅ GET Single Public successful:', getSinglePublicData.data.name);
      } else {
        console.log('❌ GET Single Public failed:', getSinglePublicResponse.status);
      }

      // Test 10: Increment Click
      console.log('\n10. Testing Increment Click...');
      const clickResponse = await fetch(`${BASE_URL}/products/trending-categories/${categoryId}/click`, {
        method: 'POST'
      });

      if (clickResponse.ok) {
        const clickData = await clickResponse.json();
        console.log('✅ Increment Click successful:', clickData.message);
      } else {
        console.log('❌ Increment Click failed:', clickResponse.status);
      }

      // Test 11: Increment Impression
      console.log('\n11. Testing Increment Impression...');
      const impressionResponse = await fetch(`${BASE_URL}/products/trending-categories/${categoryId}/impression`, {
        method: 'POST'
      });

      if (impressionResponse.ok) {
        const impressionData = await impressionResponse.json();
        console.log('✅ Increment Impression successful:', impressionData.message);
      } else {
        console.log('❌ Increment Impression failed:', impressionResponse.status);
      }

      // Test 12: Get Statistics (Admin)
      console.log('\n12. Testing GET Statistics (Admin)...');
      const statsResponse = await fetch(`${BASE_URL}/products/trending-categories/admin/stats`, {
        headers: {
          'Authorization': `Bearer ${ADMIN_TOKEN}`
        }
      });

      if (statsResponse.ok) {
        const statsData = await statsResponse.json();
        console.log('✅ GET Statistics successful:', statsData.data.total, 'total categories');
      } else {
        console.log('❌ GET Statistics failed:', statsResponse.status);
      }

      // Test 13: Delete Trending Category (Admin)
      console.log('\n13. Testing DELETE Trending Category (Admin)...');
      const deleteResponse = await fetch(`${BASE_URL}/products/trending-categories/admin/${categoryId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${ADMIN_TOKEN}`
        }
      });

      if (deleteResponse.ok) {
        const deleteData = await deleteResponse.json();
        console.log('✅ DELETE successful:', deleteData.message);
      } else {
        console.log('❌ DELETE failed:', deleteResponse.status);
      }

    } else {
      console.log('❌ CREATE failed:', createResponse.status);
      const errorData = await createResponse.json();
      console.log('Error:', errorData.message);
    }

  } catch (error) {
    console.error('❌ Test failed with error:', error.message);
  }

  console.log('\n🎉 Trending Categories API testing completed!');
}

// Test permission levels
async function testPermissionLevels() {
  console.log('\n🔐 Testing Permission Levels...\n');

  const USER_TOKEN = 'your-user-token-here'; // Replace with actual user token

  try {
    // Test 1: Public access (no token)
    console.log('1. Testing Public Access (No Token)...');
    const publicResponse = await fetch(`${BASE_URL}/products/trending-categories/public/all`);
    console.log(publicResponse.ok ? '✅ Public access allowed' : '❌ Public access denied');

    // Test 2: User access (authenticated)
    console.log('\n2. Testing User Access (Authenticated)...');
    const userResponse = await fetch(`${BASE_URL}/products/trending-categories/user/all`, {
      headers: {
        'Authorization': `Bearer ${USER_TOKEN}`
      }
    });
    console.log(userResponse.ok ? '✅ User access allowed' : '❌ User access denied');

    // Test 3: Admin access (authenticated + admin)
    console.log('\n3. Testing Admin Access (Authenticated + Admin)...');
    const adminResponse = await fetch(`${BASE_URL}/products/trending-categories/admin/all`, {
      headers: {
        'Authorization': `Bearer ${ADMIN_TOKEN}`
      }
    });
    console.log(adminResponse.ok ? '✅ Admin access allowed' : '❌ Admin access denied');

    // Test 4: Unauthorized admin access (no token)
    console.log('\n4. Testing Unauthorized Admin Access (No Token)...');
    const unauthorizedAdminResponse = await fetch(`${BASE_URL}/products/trending-categories/admin/all`);
    console.log(unauthorizedAdminResponse.status === 401 ? '✅ Unauthorized access properly blocked' : '❌ Unauthorized access not blocked');

  } catch (error) {
    console.error('❌ Permission test failed:', error.message);
  }

  console.log('\n🔐 Permission level testing completed!');
}

// Run tests
async function runTests() {
  await testTrendingCategoriesAPI();
  await testPermissionLevels();
}

runTests(); 