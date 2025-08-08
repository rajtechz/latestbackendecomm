// Test script for correct product endpoints
import fetch from 'node-fetch';

const BASE_URL = 'http://localhost:8000/api';

// Test 1: Get all public products
async function testGetAllProducts() {
  console.log('🧪 Testing: Get all public products');
  
  try {
    const response = await fetch(`${BASE_URL}/products/public/all`);
    const data = await response.json();
    
    if (data.success) {
      console.log('✅ Success! Found', data.data.length, 'products');
      
      if (data.data.length > 0) {
        const firstProduct = data.data[0];
        console.log('📦 First product:', {
          id: firstProduct._id,
          title: firstProduct.title,
          slug: firstProduct.slug,
          price: firstProduct.currentPrice,
          category: firstProduct.category
        });
        
        // Test getting this specific product by slug
        await testGetProductBySlug(firstProduct.slug);
      }
    } else {
      console.log('❌ Failed:', data.message);
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

// Test 2: Get product by slug
async function testGetProductBySlug(slug) {
  console.log('\n🧪 Testing: Get product by slug');
  
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
      console.log('📸 Images:', data.data.images?.length || 0, 'images');
    } else {
      console.log('❌ Failed:', data.message);
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

// Test 3: Get men's products
async function testGetMensProducts() {
  console.log('\n🧪 Testing: Get men\'s products');
  
  try {
    const response = await fetch(`${BASE_URL}/products/men`);
    const data = await response.json();
    
    if (data.success) {
      console.log('✅ Success! Men\'s products:');
      console.log('📊 Total products:', data.pagination?.total || data.data.length);
      console.log('📦 Products found:', data.data.length);
      
      if (data.data.length > 0) {
        console.log('📋 First 3 products:');
        data.data.slice(0, 3).forEach((product, index) => {
          console.log(`${index + 1}. ${product.title} - $${product.currentPrice} (ID: ${product._id})`);
        });
      }
    } else {
      console.log('❌ Failed:', data.message);
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

// Test 4: Get featured products
async function testGetFeaturedProducts() {
  console.log('\n🧪 Testing: Get featured products');
  
  try {
    const response = await fetch(`${BASE_URL}/products/public/featured`);
    const data = await response.json();
    
    if (data.success) {
      console.log('✅ Success! Featured products:');
      console.log('📦 Products found:', data.data.length);
      
      data.data.forEach((product, index) => {
        console.log(`${index + 1}. ${product.title} - $${product.currentPrice}`);
      });
    } else {
      console.log('❌ Failed:', data.message);
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

// Test 5: Search products
async function testSearchProducts() {
  console.log('\n🧪 Testing: Search products');
  
  try {
    const response = await fetch(`${BASE_URL}/products/public/search?q=shirt`);
    const data = await response.json();
    
    if (data.success) {
      console.log('✅ Success! Search results:');
      console.log('📦 Products found:', data.data.length);
      console.log('🔍 Search query: shirt');
      
      data.data.forEach((product, index) => {
        console.log(`${index + 1}. ${product.title} - $${product.currentPrice}`);
      });
    } else {
      console.log('❌ Failed:', data.message);
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

// Main test function
async function runAllTests() {
  console.log('🚀 Starting Correct Endpoint Tests...\n');
  
  await testGetAllProducts();
  await testGetMensProducts();
  await testGetFeaturedProducts();
  await testSearchProducts();
  
  console.log('\n✅ All tests completed!');
  console.log('\n📋 Summary of Available Endpoints:');
  console.log('✅ GET /api/products/public/all - Get all products');
  console.log('✅ GET /api/products/public/details/:slug - Get product by slug');
  console.log('✅ GET /api/products/men - Get men\'s products');
  console.log('✅ GET /api/products/public/featured - Get featured products');
  console.log('✅ GET /api/products/public/search?q=query - Search products');
  console.log('❌ GET /api/products/public/:id - DOES NOT EXIST');
}

// Run tests
runAllTests().catch(console.error);
