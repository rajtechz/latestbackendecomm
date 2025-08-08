// Test file for New Arrival API with updated schema
// This file demonstrates how to test the new arrival API with product-specific fields

const API_BASE_URL = 'http://localhost:8000/api';

// Test data for creating a new arrival product
const testNewArrivalData = {
  // Product-specific fields
  title: "Heavy GSM Printed Monster T-Shirt | Red",
  description: "Premium quality heavy GSM cotton t-shirt with monster print design. Perfect for casual wear with comfortable fit and durable material.",
  currentPrice: 895,
  originalPrice: 1399,
  discountPercentage: 36,
  bestPrice: 859,
  brand: "Monster Brand",
  color: "Red",
  material: "Heavy GSM Cotton",
  
  // Size configurations
  availableSizes: [
    { size: 'S', stock: 15, isAvailable: true },
    { size: 'M', stock: 20, isAvailable: true },
    { size: 'L', stock: 18, isAvailable: true },
    { size: 'XL', stock: 12, isAvailable: true },
    { size: 'XXL', stock: 8, isAvailable: true }
  ],
  
  // Rating and reviews
  rating: 4.2,
  numReviews: 156,
  
  // New arrival specific fields
  displayDuration: 45,
  priority: 8,
  isFeatured: true,
  tags: ["clothing", "t-shirt", "monster", "new-arrival", "casual"],
  adminNotes: "High priority new arrival with strong customer interest",
  
  // Display conditions
  displayConditions: {
    showOnHomepage: true,
    showOnCategoryPages: true,
    showOnMobile: true,
    showOnDesktop: true
  }
};

// Test images (you would need actual image files)
const testImages = [
  {
    name: 'image1.jpg',
    alt: 'Product front view - Red Monster T-Shirt',
    type: 'gallery',
    order: 0
  },
  {
    name: 'image2.jpg', 
    alt: 'Product side view - Red Monster T-Shirt',
    type: 'gallery',
    order: 1
  },
  {
    name: 'image3.jpg',
    alt: 'Product back view - Red Monster T-Shirt',
    type: 'gallery',
    order: 2
  },
  {
    name: 'image4.jpg',
    alt: 'Product detail - Monster print closeup',
    type: 'gallery',
    order: 3
  },
  {
    name: 'image5.jpg',
    alt: 'Product on model - Red Monster T-Shirt',
    type: 'gallery',
    order: 4
  }
];

// Function to login and get admin token
async function loginAdmin() {
  try {
    const response = await fetch(`${API_BASE_URL}/admin/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: 'admin@example.com',
        password: 'admin123'
      })
    });
    
    const data = await response.json();
    if (data.success) {
      return data.token;
    } else {
      throw new Error('Login failed: ' + data.message);
    }
  } catch (error) {
    console.error('Login error:', error);
    throw error;
  }
}

// Function to create a new arrival product
async function createNewArrival(token, productId = null) {
  try {
    // Create FormData for multipart/form-data
    const formData = new FormData();
    
    // Add product ID if provided
    if (productId) {
      formData.append('productId', productId);
    }
    
    // Add all the new arrival data
    Object.keys(testNewArrivalData).forEach(key => {
      if (key === 'availableSizes') {
        formData.append(key, JSON.stringify(testNewArrivalData[key]));
      } else if (key === 'displayConditions') {
        formData.append(key, JSON.stringify(testNewArrivalData[key]));
      } else if (key === 'tags') {
        formData.append(key, testNewArrivalData[key].join(','));
      } else {
        formData.append(key, testNewArrivalData[key]);
      }
    });
    
    // Add image information (you would need actual files)
    testImages.forEach((image, index) => {
      formData.append(`imageAlt_${index}`, image.alt);
      formData.append(`imageType_${index}`, image.type);
      formData.append(`imageOrder_${index}`, image.order);
      // formData.append('images', imageFile); // You would add actual image files here
    });
    
    const response = await fetch(`${API_BASE_URL}/products/new-arrival`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: formData
    });
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Create new arrival error:', error);
    throw error;
  }
}

// Function to get all new arrivals
async function getAllNewArrivals(token) {
  try {
    const response = await fetch(`${API_BASE_URL}/products/new-arrival`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Get new arrivals error:', error);
    throw error;
  }
}

// Function to get public new arrivals
async function getPublicNewArrivals() {
  try {
    const response = await fetch(`${API_BASE_URL}/products/new-arrival/public`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Get public new arrivals error:', error);
    throw error;
  }
}

// Function to get featured new arrivals
async function getFeaturedNewArrivals() {
  try {
    const response = await fetch(`${API_BASE_URL}/products/new-arrival/public/featured`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Get featured new arrivals error:', error);
    throw error;
  }
}

// Function to update a new arrival
async function updateNewArrival(token, newArrivalId, updateData) {
  try {
    const response = await fetch(`${API_BASE_URL}/products/new-arrival/${newArrivalId}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(updateData)
    });
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Update new arrival error:', error);
    throw error;
  }
}

// Function to delete a new arrival
async function deleteNewArrival(token, newArrivalId) {
  try {
    const response = await fetch(`${API_BASE_URL}/products/new-arrival/${newArrivalId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Delete new arrival error:', error);
    throw error;
  }
}

// Main test function
async function runTests() {
  try {
    console.log('🚀 Starting New Arrival API Tests...\n');
    
    // Step 1: Login as admin
    console.log('1. Logging in as admin...');
    const token = await loginAdmin();
    console.log('✅ Login successful\n');
    
    // Step 2: Get existing new arrivals
    console.log('2. Getting existing new arrivals...');
    const existingArrivals = await getAllNewArrivals(token);
    console.log(`✅ Found ${existingArrivals.data?.length || 0} existing new arrivals\n`);
    
    // Step 3: Get public new arrivals
    console.log('3. Getting public new arrivals...');
    const publicArrivals = await getPublicNewArrivals();
    console.log(`✅ Found ${publicArrivals.data?.length || 0} public new arrivals\n`);
    
    // Step 4: Get featured new arrivals
    console.log('4. Getting featured new arrivals...');
    const featuredArrivals = await getFeaturedNewArrivals();
    console.log(`✅ Found ${featuredArrivals.data?.length || 0} featured new arrivals\n`);
    
    // Step 5: Create a new arrival (commented out as it requires actual product ID and images)
    console.log('5. Creating new arrival (requires actual product ID and images)...');
    // const newArrival = await createNewArrival(token, 'YOUR_PRODUCT_ID_HERE');
    // console.log('✅ New arrival created successfully\n');
    
    console.log('📋 Test Summary:');
    console.log('- Login: ✅');
    console.log('- Get all new arrivals: ✅');
    console.log('- Get public new arrivals: ✅');
    console.log('- Get featured new arrivals: ✅');
    console.log('- Create new arrival: ⚠️ (requires actual product ID and images)');
    console.log('\n🎯 To test creation, you need:');
    console.log('1. A valid product ID from your database');
    console.log('2. At least 3 image files');
    console.log('3. Update the createNewArrival function with actual files');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Example cURL commands for testing

console.log(`
📝 Example cURL Commands for Testing:

1. Login as Admin:
curl -X POST http://localhost:8000/api/admin/login \\
  -H "Content-Type: application/json" \\
  -d '{
    "email": "admin@example.com",
    "password": "admin123"
  }'

2. Create New Arrival (with actual files):
curl -X POST http://localhost:8000/api/products/new-arrival \\
  -H "Authorization: Bearer YOUR_TOKEN" \\
  -F "productId=YOUR_PRODUCT_ID" \\
  -F "title=Heavy GSM Printed Monster T-Shirt | Red" \\
  -F "description=Premium quality heavy GSM cotton t-shirt with monster print design" \\
  -F "currentPrice=895" \\
  -F "originalPrice=1399" \\
  -F "discountPercentage=36" \\
  -F "bestPrice=859" \\
  -F "brand=Monster Brand" \\
  -F "color=Red" \\
  -F "material=Heavy GSM Cotton" \\
  -F "rating=4.2" \\
  -F "numReviews=156" \\
  -F "availableSizes=[{\\"size\\":\\"S\\",\\"stock\\":15,\\"isAvailable\\":true},{\\"size\\":\\"M\\",\\"stock\\":20,\\"isAvailable\\":true}]" \\
  -F "displayDuration=45" \\
  -F "priority=8" \\
  -F "isFeatured=true" \\
  -F "tags=clothing,t-shirt,monster,new-arrival" \\
  -F "adminNotes=High priority new arrival with strong customer interest" \\
  -F "images=@image1.jpg" \\
  -F "images=@image2.jpg" \\
  -F "images=@image3.jpg" \\
  -F "imageAlt_0=Product front view - Red Monster T-Shirt" \\
  -F "imageAlt_1=Product side view - Red Monster T-Shirt" \\
  -F "imageAlt_2=Product back view - Red Monster T-Shirt"

3. Get All New Arrivals (Admin):
curl -X GET http://localhost:8000/api/products/new-arrival \\
  -H "Authorization: Bearer YOUR_TOKEN"

4. Get Public New Arrivals:
curl -X GET http://localhost:8000/api/products/new-arrival/public

5. Get Featured New Arrivals:
curl -X GET http://localhost:8000/api/products/new-arrival/public/featured

6. Update New Arrival:
curl -X PUT http://localhost:8000/api/products/new-arrival/NEW_ARRIVAL_ID \\
  -H "Authorization: Bearer YOUR_TOKEN" \\
  -H "Content-Type: application/json" \\
  -d '{
    "currentPrice": 850,
    "discountPercentage": 39,
    "priority": 9
  }'

7. Delete New Arrival:
curl -X DELETE http://localhost:8000/api/products/new-arrival/NEW_ARRIVAL_ID \\
  -H "Authorization: Bearer YOUR_TOKEN"
`);

// Run tests if this file is executed directly
if (typeof window === 'undefined') {
  // Node.js environment
  runTests();
}

export {
  loginAdmin,
  createNewArrival,
  getAllNewArrivals,
  getPublicNewArrivals,
  getFeaturedNewArrivals,
  updateNewArrival,
  deleteNewArrival,
  testNewArrivalData,
  testImages
}; 