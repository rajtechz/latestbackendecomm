import fetch from 'node-fetch';
import FormData from 'form-data';
import fs from 'fs';
import path from 'path';

const BASE_URL = 'http://localhost:8000/api';

// Placeholder for admin token (replace with actual token)
const ADMIN_TOKEN = 'your-admin-token-here';

async function testProductUpload() {
  console.log('🧪 Testing Product Upload Fix...\n');

  try {
    // Create form data
    const formData = new FormData();
    
    // Add text fields
    formData.append('title', 'Test Product Upload Fix');
    formData.append('slug', 'test-product-upload-fix');
    formData.append('description', 'Testing the product upload fix with multiple images');
    formData.append('shortDescription', 'Test product for upload fix');
    formData.append('currentPrice', '999');
    formData.append('originalPrice', '1499');
    formData.append('bestPrice', '899');
    formData.append('category', 'men');
    formData.append('subCategory', 'test');
    formData.append('brand', 'TEST');
    formData.append('model', 'TEST-001');
    formData.append('sku', 'TEST-SKU-001');
    formData.append('displayOrder', '1');
    formData.append('isActive', 'true');
    formData.append('isFeatured', 'true');
    formData.append('isNew', 'true');
    formData.append('stockQuantity', '10');
    formData.append('allowBackorder', 'false');
    formData.append('availableSizes', 'S,M,L,XL');
    formData.append('availableColors', JSON.stringify([
      { name: "White", code: "#FFFFFF", stockQuantity: 5 },
      { name: "Black", code: "#000000", stockQuantity: 5 }
    ]));
    formData.append('labels', 'TEST,TRENDING');
    formData.append('tags', 'test,upload,fix');
    formData.append('keywords', 'test product upload fix');
    formData.append('material', 'Test Material');
    formData.append('careInstructions', 'Test care instructions');
    formData.append('specifications', JSON.stringify([
      { name: "Material", value: "Test Material" },
      { name: "Fit", value: "Test Fit" }
    ]));
    formData.append('metaTitle', 'Test Product Upload Fix');
    formData.append('metaDescription', 'Testing the product upload fix');

    // Add dummy image files (create small test images)
    const testImagePath = path.join(process.cwd(), 'test-image.jpg');
    
    // Create a small test image if it doesn't exist
    if (!fs.existsSync(testImagePath)) {
      console.log('Creating test image...');
      // Create a minimal JPEG file
      const minimalJpeg = Buffer.from([
        0xFF, 0xD8, 0xFF, 0xE0, 0x00, 0x10, 0x4A, 0x46, 0x49, 0x46, 0x00, 0x01,
        0x01, 0x01, 0x00, 0x48, 0x00, 0x48, 0x00, 0x00, 0xFF, 0xDB, 0x00, 0x43,
        0x00, 0x08, 0x06, 0x06, 0x07, 0x06, 0x05, 0x08, 0x07, 0x07, 0x07, 0x09,
        0x09, 0x08, 0x0A, 0x0C, 0x14, 0x0D, 0x0C, 0x0B, 0x0B, 0x0C, 0x19, 0x12,
        0x13, 0x0F, 0x14, 0x1D, 0x1A, 0x1F, 0x1E, 0x1D, 0x1A, 0x1C, 0x1C, 0x20,
        0x24, 0x2E, 0x27, 0x20, 0x22, 0x2C, 0x23, 0x1C, 0x1C, 0x28, 0x37, 0x29,
        0x2C, 0x30, 0x31, 0x34, 0x34, 0x34, 0x1F, 0x27, 0x39, 0x3D, 0x38, 0x32,
        0x3C, 0x2E, 0x33, 0x34, 0x32, 0xFF, 0xC0, 0x00, 0x11, 0x08, 0x00, 0x01,
        0x00, 0x01, 0x01, 0x01, 0x11, 0x00, 0x02, 0x11, 0x01, 0x03, 0x11, 0x01,
        0xFF, 0xC4, 0x00, 0x14, 0x00, 0x01, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
        0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x08, 0xFF, 0xC4,
        0x00, 0x14, 0x10, 0x01, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
        0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0xFF, 0xDA, 0x00, 0x0C,
        0x03, 0x01, 0x00, 0x02, 0x11, 0x03, 0x11, 0x00, 0x3F, 0x00, 0x8A, 0xFF,
        0xD9
      ]);
      fs.writeFileSync(testImagePath, minimalJpeg);
    }

    // Add multiple test images
    for (let i = 1; i <= 3; i++) {
      const imagePath = path.join(process.cwd(), `test-image-${i}.jpg`);
      if (!fs.existsSync(imagePath)) {
        fs.copyFileSync(testImagePath, imagePath);
      }
      formData.append('images', fs.createReadStream(imagePath));
    }

    console.log('📤 Sending request with 3 test images...');

    const response = await fetch(`${BASE_URL}/products/create`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${ADMIN_TOKEN}`,
        ...formData.getHeaders()
      },
      body: formData
    });

    console.log('📥 Response Status:', response.status);
    console.log('📥 Response Headers:', Object.fromEntries(response.headers.entries()));

    const responseData = await response.json();
    console.log('📥 Response Body:', JSON.stringify(responseData, null, 2));

    if (response.ok) {
      console.log('✅ Product upload successful!');
      console.log('📦 Product ID:', responseData.data._id);
      console.log('🖼️ Images uploaded:', responseData.data.images.length);
    } else {
      console.log('❌ Product upload failed!');
      console.log('🚨 Error:', responseData.message);
    }

  } catch (error) {
    console.error('❌ Test failed with error:', error.message);
  }

  console.log('\n🎉 Product upload test completed!');
}

// Run the test
testProductUpload(); 