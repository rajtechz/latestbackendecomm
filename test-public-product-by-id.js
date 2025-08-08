// Test script for public product by ID endpoint
import fetch from 'node-fetch';

const BASE_URL = 'http://localhost:8000/api';

// Test 1: Get all products first to get a valid ID
async function testGetAllProducts() {
  console.log('🧪 Testing: Get all products to find valid IDs');
  
  try {
    const response = await fetch(`${BASE_URL}/products/public/all`);
    const data = await response.json();
    
    if (data.success && data.data.length > 0) {
      console.log('✅ Success! Found', data.data.length, 'products');
      
      const firstProduct = data.data[0];
      console.log('📦 First product:', {
        id: firstProduct._id,
        title: firstProduct.title,
        slug: firstProduct.slug,
        price: firstProduct.currentPrice,
        category: firstProduct.category
      });
      
      // Test getting this specific product by ID
      await testGetProductById(firstProduct._id);
      await testGetProductBySlug(firstProduct.slug);
      
      // Test with a few more products
      if (data.data.length > 1) {
        const secondProduct = data.data[1];
        await testGetProductById(secondProduct._id);
      }
    } else {
      console.log('❌ No products found or failed:', data.message);
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

// Test 2: Get product by ID (NEW ENDPOINT)
async function testGetProductById(productId) {
  console.log(`\n🧪 Testing: Get product by ID: ${productId}`);
  
  try {
    const response = await fetch(`${BASE_URL}/products/public/${productId}`);
    const data = await response.json();
    
    if (data.success) {
      console.log('✅ Success! Product by ID:');
      console.log('📦 Title:', data.data.title);
      console.log('💰 Price:', data.data.currentPrice);
      console.log('🏷️ Category:', data.data.category);
      console.log('📊 Views:', data.data.views);
      console.log('⭐ Rating:', data.data.rating);
      console.log('💬 Reviews:', data.data.numReviews);
      console.log('📸 Images:', data.data.images?.length || 0, 'images');
      console.log('📏 Sizes:', data.data.availableSizes?.length || 0, 'sizes');
      console.log('🎨 Colors:', data.data.availableColors?.length || 0, 'colors');
    } else {
      console.log('❌ Failed:', data.message);
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

// Test 3: Get product by slug (for comparison)
async function testGetProductBySlug(slug) {
  console.log(`\n🧪 Testing: Get product by slug: ${slug}`);
  
  try {
    const response = await fetch(`${BASE_URL}/products/public/details/${slug}`);
    const data = await response.json();
    
    if (data.success) {
      console.log('✅ Success! Product by slug:');
      console.log('📦 Title:', data.data.title);
      console.log('💰 Price:', data.data.currentPrice);
      console.log('🏷️ Category:', data.data.category);
      console.log('📊 Views:', data.data.views);
      console.log('⭐ Rating:', data.data.rating);
      console.log('💬 Reviews:', data.data.numReviews);
    } else {
      console.log('❌ Failed:', data.message);
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

// Test 4: Test with invalid ID
async function testInvalidProductId() {
  console.log('\n🧪 Testing: Get product with invalid ID');
  
  try {
    const invalidId = '507f1f77bcf86cd799439011'; // Random MongoDB ObjectId
    const response = await fetch(`${BASE_URL}/products/public/${invalidId}`);
    const data = await response.json();
    
    if (data.success) {
      console.log('❌ Unexpected success with invalid ID');
    } else {
      console.log('✅ Correctly failed with invalid ID:', data.message);
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

// Test 5: Test men's products
async function testGetMensProducts() {
  console.log('\n🧪 Testing: Get men\'s products');
  
  try {
    const response = await fetch(`${BASE_URL}/products/men`);
    const data = await response.json();
    
    if (data.success && data.data.length > 0) {
      console.log('✅ Success! Men\'s products:');
      console.log('📦 Products found:', data.data.length);
      
      const firstMensProduct = data.data[0];
      console.log('📋 First men\'s product:', {
        id: firstMensProduct._id,
        title: firstMensProduct.title,
        price: firstMensProduct.currentPrice
      });
      
      // Test getting this men's product by ID
      await testGetProductById(firstMensProduct._id);
    } else {
      console.log('❌ No men\'s products found or failed:', data.message);
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

// Main test function
async function runAllTests() {
  console.log('🚀 Starting Public Product by ID Tests...\n');
  
  await testGetAllProducts();
  await testInvalidProductId();
  await testGetMensProducts();
  
  console.log('\n✅ All tests completed!');
  console.log('\n📋 Summary of Available Endpoints:');
  console.log('✅ GET /api/products/public/:id - Get product by ID (NEW!)');
  console.log('✅ GET /api/products/public/details/:slug - Get product by slug');
  console.log('✅ GET /api/products/public/all - Get all products');
  console.log('✅ GET /api/products/men - Get men\'s products');
  console.log('✅ GET /api/products/public/featured - Get featured products');
  console.log('✅ GET /api/products/public/search?q=query - Search products');
}

// Run tests
runAllTests().catch(console.error);
