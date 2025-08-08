// Test script for getting single product details from men's section
import fetch from 'node-fetch';

const BASE_URL = 'http://localhost:8000/api';

// Test 1: Get all men's products
async function testGetMensProducts() {
  console.log('🧪 Testing: Get all men\'s products');
  
  try {
    const response = await fetch(`${BASE_URL}/products/men`);
    const data = await response.json();
    
    if (data.success) {
      console.log('✅ Success! Found', data.data.length, 'men\'s products');
      
      if (data.data.length > 0) {
        const firstProduct = data.data[0];
        console.log('📦 First product:', {
          id: firstProduct._id,
          title: firstProduct.title,
          price: firstProduct.currentPrice,
          category: firstProduct.category
        });
        
        // Test getting this specific product
        await testGetSingleProduct(firstProduct._id);
        await testGetProductBySlug(firstProduct.slug);
      }
    } else {
      console.log('❌ Failed:', data.message);
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

// Test 2: Get single product by ID
async function testGetSingleProduct(productId) {
  console.log('\n🧪 Testing: Get single product by ID');
  
  try {
    const response = await fetch(`${BASE_URL}/products/public/${productId}`);
    const data = await response.json();
    
    if (data.success) {
      console.log('✅ Success! Product details:');
      console.log('📦 Title:', data.data.title);
      console.log('💰 Price:', data.data.currentPrice);
      console.log('🏷️ Category:', data.data.category);
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

// Test 3: Get product by slug
async function testGetProductBySlug(slug) {
  console.log('\n🧪 Testing: Get product by slug');
  
  try {
    const response = await fetch(`${BASE_URL}/products/public/details/${slug}`);
    const data = await response.json();
    
    if (data.success) {
      console.log('✅ Success! Product by slug:');
      console.log('📦 Title:', data.data.title);
      console.log('💰 Price:', data.data.currentPrice);
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

// Test 4: Get men's products with filters
async function testGetMensProductsWithFilters() {
  console.log('\n🧪 Testing: Get men\'s products with filters');
  
  try {
    const response = await fetch(`${BASE_URL}/products/men?page=1&limit=5&sortBy=currentPrice&sortOrder=desc&labels=NEW DROP,EXCLUSIVE`);
    const data = await response.json();
    
    if (data.success) {
      console.log('✅ Success! Filtered men\'s products:');
      console.log('📊 Total products:', data.pagination.total);
      console.log('📄 Current page:', data.pagination.page);
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

// Test 5: Get men's products by category
async function testGetMensProductsByCategory() {
  console.log('\n🧪 Testing: Get men\'s products by category');
  
  try {
    const response = await fetch(`${BASE_URL}/products/public/category/men`);
    const data = await response.json();
    
    if (data.success) {
      console.log('✅ Success! Men\'s category products:');
      console.log('📊 Total products:', data.pagination.total);
      console.log('📦 Products found:', data.data.length);
      console.log('🏷️ Category:', data.category);
    } else {
      console.log('❌ Failed:', data.message);
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

// Main test function
async function runAllTests() {
  console.log('🚀 Starting Single Product API Tests...\n');
  
  await testGetMensProducts();
  await testGetMensProductsWithFilters();
  await testGetMensProductsByCategory();
  
  console.log('\n✅ All tests completed!');
}

// Run tests
runAllTests().catch(console.error);
