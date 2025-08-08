import fetch from 'node-fetch';

const BASE_URL = 'http://localhost:8000/api';

// Sample data for products based on the image
const sampleProducts = [
  {
    title: "Classic White T-Shirt",
    slug: "classic-white-t-shirt",
    description: "Premium quality classic white t-shirt with comfortable fit and durable material",
    shortDescription: "Comfortable and stylish classic white t-shirt",
    currentPrice: 899,
    originalPrice: 1499,
    bestPrice: 799,
    category: "men",
    subCategory: "t-shirts",
    brand: "CARTUNO",
    model: "CW-001",
    sku: "MEN-TSHIRT-001",
    displayOrder: 1,
    isActive: true,
    isFeatured: true,
    isNew: true,
    stockQuantity: 50,
    allowBackorder: false,
    availableSizes: "S,M,L,XL,XXL",
    availableColors: JSON.stringify([
      { name: "White", code: "#FFFFFF", stockQuantity: 20 },
      { name: "Black", code: "#000000", stockQuantity: 15 },
      { name: "Navy", code: "#000080", stockQuantity: 15 }
    ]),
    labels: "NEW DROP,EXCLUSIVE",
    tags: "classic,white,t-shirt,comfortable",
    keywords: "classic white t-shirt, comfortable wear, premium quality",
    material: "100% Cotton",
    careInstructions: "Machine wash cold, tumble dry low",
    specifications: JSON.stringify([
      { name: "Material", value: "100% Cotton" },
      { name: "Fit", value: "Regular Fit" },
      { name: "Sleeve", value: "Short Sleeve" },
      { name: "Neck", value: "Round Neck" }
    ]),
    metaTitle: "Classic White T-Shirt - CARTUNO",
    metaDescription: "Premium quality classic white t-shirt with comfortable fit and durable material"
  },
  {
    title: "Premium Cotton Shirt",
    slug: "premium-cotton-shirt",
    description: "High-quality premium cotton shirt with excellent breathability and comfort",
    shortDescription: "Premium cotton shirt for all occasions",
    currentPrice: 1299,
    originalPrice: 1999,
    bestPrice: 1199,
    category: "men",
    subCategory: "shirts",
    brand: "CARTUNO",
    model: "PC-002",
    sku: "MEN-SHIRT-002",
    displayOrder: 2,
    isActive: true,
    isFeatured: true,
    isNew: false,
    stockQuantity: 35,
    allowBackorder: false,
    availableSizes: "S,M,L,XL",
    availableColors: JSON.stringify([
      { name: "Light Blue", code: "#ADD8E6", stockQuantity: 20 },
      { name: "White", code: "#FFFFFF", stockQuantity: 15 }
    ]),
    labels: "PREMIUM,TRENDING",
    tags: "premium,cotton,shirt,breathable",
    keywords: "premium cotton shirt, breathable, comfortable",
    material: "100% Premium Cotton",
    careInstructions: "Machine wash cold, iron on low heat",
    specifications: JSON.stringify([
      { name: "Material", value: "100% Premium Cotton" },
      { name: "Fit", value: "Regular Fit" },
      { name: "Sleeve", value: "Short Sleeve" },
      { name: "Style", value: "Casual" }
    ]),
    metaTitle: "Premium Cotton Shirt - CARTUNO",
    metaDescription: "High-quality premium cotton shirt with excellent breathability and comfort"
  },
  {
    title: "Slim Fit Jeans",
    slug: "slim-fit-jeans",
    description: "Modern slim fit jeans with stretch comfort and contemporary style",
    shortDescription: "Slim fit jeans with stretch comfort",
    currentPrice: 1599,
    originalPrice: 2499,
    bestPrice: 1499,
    category: "men",
    subCategory: "jeans",
    brand: "CARTUNO",
    model: "SFJ-003",
    sku: "MEN-JEANS-003",
    displayOrder: 3,
    isActive: true,
    isFeatured: false,
    isNew: true,
    stockQuantity: 40,
    allowBackorder: false,
    availableSizes: "28,30,32,34,36,38",
    availableColors: JSON.stringify([
      { name: "Khaki", code: "#F4F4F4", stockQuantity: 25 },
      { name: "Navy", code: "#000080", stockQuantity: 15 }
    ]),
    labels: "NEW DROP,TRENDING",
    tags: "slim,fit,jeans,stretch",
    keywords: "slim fit jeans, stretch comfort, modern style",
    material: "98% Cotton, 2% Elastane",
    careInstructions: "Machine wash cold, tumble dry low",
    specifications: JSON.stringify([
      { name: "Material", value: "98% Cotton, 2% Elastane" },
      { name: "Fit", value: "Slim Fit" },
      { name: "Rise", value: "Mid Rise" },
      { name: "Leg", value: "Slim Leg" }
    ]),
    metaTitle: "Slim Fit Jeans - CARTUNO",
    metaDescription: "Modern slim fit jeans with stretch comfort and contemporary style"
  }
];

// Placeholder for admin token (replace with actual token)
const ADMIN_TOKEN = 'your-admin-token-here';

async function testProductAPI() {
  console.log('🚀 Testing Product API...\n');

  try {
    // Test 1: Create Products (Admin)
    console.log('1. Testing CREATE Products (Admin)...');
    const createdProducts = [];
    
    for (const productData of sampleProducts) {
      const createResponse = await fetch(`${BASE_URL}/products/create`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${ADMIN_TOKEN}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(productData)
      });

      if (createResponse.ok) {
        const createData = await createResponse.json();
        console.log(`✅ CREATE successful for: ${createData.data.title}`);
        createdProducts.push(createData.data._id);
      } else {
        console.log(`❌ CREATE failed for: ${productData.title}`);
        const errorData = await createResponse.json();
        console.log('Error:', errorData.message);
      }
    }
    
    if (createdProducts.length > 0) {
      const firstProductId = createdProducts[0];
      
      // Test 2: Get Men's Products (Public)
      console.log('\n2. Testing GET Men\'s Products (Public)...');
      const menProductsResponse = await fetch(`${BASE_URL}/products/men`);

      if (menProductsResponse.ok) {
        const menProductsData = await menProductsResponse.json();
        console.log('✅ GET Men\'s Products successful:', menProductsData.data.length, 'products found');
        
        // Display product details
        menProductsData.data.forEach((product, index) => {
          console.log(`   ${index + 1}. ${product.title} - ₹${product.currentPrice} (${product.labels.join(', ')})`);
          console.log(`      Images: ${product.images.length} images available`);
        });
      } else {
        console.log('❌ GET Men\'s Products failed:', menProductsResponse.status);
      }

      // Test 3: Get All Products (Admin)
      console.log('\n3. Testing GET All Products (Admin)...');
      const getAllResponse = await fetch(`${BASE_URL}/products/admin/all`, {
        headers: {
          'Authorization': `Bearer ${ADMIN_TOKEN}`
        }
      });

      if (getAllResponse.ok) {
        const getAllData = await getAllResponse.json();
        console.log('✅ GET All successful:', getAllData.data.length, 'products found');
      } else {
        console.log('❌ GET All failed:', getAllResponse.status);
      }

      // Test 4: Get Single Product (Admin)
      console.log('\n4. Testing GET Single Product (Admin)...');
      const getSingleResponse = await fetch(`${BASE_URL}/products/admin/${firstProductId}`, {
        headers: {
          'Authorization': `Bearer ${ADMIN_TOKEN}`
        }
      });

      if (getSingleResponse.ok) {
        const getSingleData = await getSingleResponse.json();
        console.log('✅ GET Single successful:', getSingleData.data.title);
        console.log(`   Images: ${getSingleData.data.images.length} images`);
        console.log(`   Labels: ${getSingleData.data.labels.join(', ')}`);
      } else {
        console.log('❌ GET Single failed:', getSingleResponse.status);
      }

      // Test 5: Update Product (Admin)
      console.log('\n5. Testing UPDATE Product (Admin)...');
      const updateData = {
        ...sampleProducts[0],
        title: "Updated Classic White T-Shirt",
        description: "Updated description for the classic white t-shirt"
      };

      const updateResponse = await fetch(`${BASE_URL}/products/admin/${firstProductId}`, {
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

      // Test 6: Get Featured Products (Public)
      console.log('\n6. Testing GET Featured Products (Public)...');
      const getFeaturedResponse = await fetch(`${BASE_URL}/products/public/featured`);

      if (getFeaturedResponse.ok) {
        const getFeaturedData = await getFeaturedResponse.json();
        console.log('✅ GET Featured successful:', getFeaturedData.data.length, 'featured products');
      } else {
        console.log('❌ GET Featured failed:', getFeaturedResponse.status);
      }

      // Test 7: Get New Products (Public)
      console.log('\n7. Testing GET New Products (Public)...');
      const getNewResponse = await fetch(`${BASE_URL}/products/public/new`);

      if (getNewResponse.ok) {
        const getNewData = await getNewResponse.json();
        console.log('✅ GET New successful:', getNewData.data.length, 'new products');
      } else {
        console.log('❌ GET New failed:', getNewResponse.status);
      }

      // Test 8: Get Products by Labels (Public)
      console.log('\n8. Testing GET Products by Labels (Public)...');
      const getByLabelsResponse = await fetch(`${BASE_URL}/products/public/labels/NEW DROP,EXCLUSIVE`);

      if (getByLabelsResponse.ok) {
        const getByLabelsData = await getByLabelsResponse.json();
        console.log('✅ GET By Labels successful:', getByLabelsData.data.length, 'products with labels');
      } else {
        console.log('❌ GET By Labels failed:', getByLabelsResponse.status);
      }

      // Test 9: Search Products (Public)
      console.log('\n9. Testing Search Products (Public)...');
      const searchResponse = await fetch(`${BASE_URL}/products/public/search?q=white&category=men`);

      if (searchResponse.ok) {
        const searchData = await searchResponse.json();
        console.log('✅ Search successful:', searchData.data.length, 'products found');
      } else {
        console.log('❌ Search failed:', searchResponse.status);
      }

      // Test 10: Get Product Details (Public)
      console.log('\n10. Testing GET Product Details (Public)...');
      const getDetailsResponse = await fetch(`${BASE_URL}/products/public/details/classic-white-t-shirt`);

      if (getDetailsResponse.ok) {
        const getDetailsData = await getDetailsResponse.json();
        console.log('✅ GET Details successful:', getDetailsData.data.title);
        console.log(`   Price: ₹${getDetailsData.data.currentPrice}`);
        console.log(`   Images: ${getDetailsData.data.images.length} images`);
      } else {
        console.log('❌ GET Details failed:', getDetailsResponse.status);
      }

      // Test 11: Get Related Products (Public)
      console.log('\n11. Testing GET Related Products (Public)...');
      const getRelatedResponse = await fetch(`${BASE_URL}/products/public/related/${firstProductId}`);

      if (getRelatedResponse.ok) {
        const getRelatedData = await getRelatedResponse.json();
        console.log('✅ GET Related successful:', getRelatedData.data.length, 'related products');
      } else {
        console.log('❌ GET Related failed:', getRelatedResponse.status);
      }

      // Test 12: Increment Click (Public)
      console.log('\n12. Testing Increment Click (Public)...');
      const clickResponse = await fetch(`${BASE_URL}/products/${firstProductId}/click`, {
        method: 'POST'
      });

      if (clickResponse.ok) {
        const clickData = await clickResponse.json();
        console.log('✅ Increment Click successful:', clickData.message);
      } else {
        console.log('❌ Increment Click failed:', clickResponse.status);
      }

      // Test 13: Increment Impression (Public)
      console.log('\n13. Testing Increment Impression (Public)...');
      const impressionResponse = await fetch(`${BASE_URL}/products/${firstProductId}/impression`, {
        method: 'POST'
      });

      if (impressionResponse.ok) {
        const impressionData = await impressionResponse.json();
        console.log('✅ Increment Impression successful:', impressionData.message);
      } else {
        console.log('❌ Increment Impression failed:', impressionResponse.status);
      }

      // Test 14: Get Product Statistics (Admin)
      console.log('\n14. Testing GET Product Statistics (Admin)...');
      const statsResponse = await fetch(`${BASE_URL}/products/admin/stats`, {
        headers: {
          'Authorization': `Bearer ${ADMIN_TOKEN}`
        }
      });

      if (statsResponse.ok) {
        const statsData = await statsResponse.json();
        console.log('✅ GET Statistics successful:', statsData.data.total, 'total products');
      } else {
        console.log('❌ GET Statistics failed:', statsResponse.status);
      }

      // Test 15: Test Category-Specific Routes
      console.log('\n15. Testing Category-Specific Routes...');
      
      // Test men's featured products
      const menFeaturedResponse = await fetch(`${BASE_URL}/products/men/featured`);
      console.log(menFeaturedResponse.ok ? '✅ Men\'s Featured successful' : '❌ Men\'s Featured failed');
      
      // Test men's new products
      const menNewResponse = await fetch(`${BASE_URL}/products/men/new`);
      console.log(menNewResponse.ok ? '✅ Men\'s New successful' : '❌ Men\'s New failed');

      // Test 16: Delete Products (Admin)
      console.log('\n16. Testing DELETE Products (Admin)...');
      for (const productId of createdProducts) {
        const deleteResponse = await fetch(`${BASE_URL}/products/admin/${productId}`, {
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
      }
    }

  } catch (error) {
    console.error('❌ Test failed with error:', error.message);
  }

  console.log('\n🎉 Product API testing completed!');
}

// Test permission levels
async function testPermissionLevels() {
  console.log('\n🔐 Testing Permission Levels...\n');

  const USER_TOKEN = 'your-user-token-here'; // Replace with actual user token

  try {
    // Test 1: Public access (no token)
    console.log('1. Testing Public Access (No Token)...');
    const publicResponse = await fetch(`${BASE_URL}/products/public/all`);
    console.log(publicResponse.ok ? '✅ Public access allowed' : '❌ Public access denied');

    // Test 2: User access (authenticated)
    console.log('\n2. Testing User Access (Authenticated)...');
    const userResponse = await fetch(`${BASE_URL}/products/user/all`, {
      headers: {
        'Authorization': `Bearer ${USER_TOKEN}`
      }
    });
    console.log(userResponse.ok ? '✅ User access allowed' : '❌ User access denied');

    // Test 3: Admin access (authenticated + admin)
    console.log('\n3. Testing Admin Access (Authenticated + Admin)...');
    const adminResponse = await fetch(`${BASE_URL}/products/admin/all`, {
      headers: {
        'Authorization': `Bearer ${ADMIN_TOKEN}`
      }
    });
    console.log(adminResponse.ok ? '✅ Admin access allowed' : '❌ Admin access denied');

    // Test 4: Unauthorized admin access (no token)
    console.log('\n4. Testing Unauthorized Admin Access (No Token)...');
    const unauthorizedAdminResponse = await fetch(`${BASE_URL}/products/admin/all`);
    console.log(unauthorizedAdminResponse.status === 401 ? '✅ Unauthorized access properly blocked' : '❌ Unauthorized access not blocked');

  } catch (error) {
    console.error('❌ Permission test failed:', error.message);
  }

  console.log('\n🔐 Permission level testing completed!');
}

// Test category functionality
async function testCategoryFunctionality() {
  console.log('\n🏷️ Testing Category Functionality...\n');

  try {
    // Test different categories
    const categories = ['men', 'women', 'kids', 'furniture', 'electronics', 'beauty', 'fashion', 'sport'];
    
    for (const category of categories) {
      console.log(`Testing ${category} category...`);
      
      const response = await fetch(`${BASE_URL}/products/${category}`);
      
      if (response.ok) {
        const data = await response.json();
        console.log(`✅ ${category} category successful: ${data.data.length} products`);
      } else {
        console.log(`❌ ${category} category failed: ${response.status}`);
      }
    }

    // Test featured products for men
    console.log('\nTesting men\'s featured products...');
    const menFeaturedResponse = await fetch(`${BASE_URL}/products/men/featured`);
    
    if (menFeaturedResponse.ok) {
      const menFeaturedData = await menFeaturedResponse.json();
      console.log('✅ Men\'s featured products:', menFeaturedData.data.length, 'products');
    } else {
      console.log('❌ Men\'s featured products failed:', menFeaturedResponse.status);
    }

  } catch (error) {
    console.error('❌ Category test failed:', error.message);
  }

  console.log('\n🏷️ Category functionality testing completed!');
}

// Test search functionality
async function testSearchFunctionality() {
  console.log('\n🔍 Testing Search Functionality...\n');

  try {
    // Test search for "white"
    console.log('1. Testing search for "white"...');
    const whiteSearchResponse = await fetch(`${BASE_URL}/products/public/search?q=white`);
    
    if (whiteSearchResponse.ok) {
      const whiteSearchData = await whiteSearchResponse.json();
      console.log('✅ White search successful:', whiteSearchData.data.length, 'results');
    } else {
      console.log('❌ White search failed:', whiteSearchResponse.status);
    }

    // Test search for "cotton"
    console.log('\n2. Testing search for "cotton"...');
    const cottonSearchResponse = await fetch(`${BASE_URL}/products/public/search?q=cotton`);
    
    if (cottonSearchResponse.ok) {
      const cottonSearchData = await cottonSearchResponse.json();
      console.log('✅ Cotton search successful:', cottonSearchData.data.length, 'results');
    } else {
      console.log('❌ Cotton search failed:', cottonSearchResponse.status);
    }

    // Test search with category filter
    console.log('\n3. Testing search with category filter...');
    const categorySearchResponse = await fetch(`${BASE_URL}/products/public/search?q=shirt&category=men`);
    
    if (categorySearchResponse.ok) {
      const categorySearchData = await categorySearchResponse.json();
      console.log('✅ Category search successful:', categorySearchData.data.length, 'results');
    } else {
      console.log('❌ Category search failed:', categorySearchResponse.status);
    }

  } catch (error) {
    console.error('❌ Search test failed:', error.message);
  }

  console.log('\n🔍 Search functionality testing completed!');
}

// Run tests
async function runTests() {
  await testProductAPI();
  await testPermissionLevels();
  await testCategoryFunctionality();
  await testSearchFunctionality();
}

runTests(); 