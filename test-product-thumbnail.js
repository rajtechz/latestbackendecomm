import fetch from 'node-fetch';
import FormData from 'form-data';
import fs from 'fs';
import path from 'path';

const BASE_URL = 'http://localhost:8000/api';

// Placeholder for admin token (replace with actual token)
const ADMIN_TOKEN = 'your-admin-token-here';

async function testProductWithThumbnail() {
  console.log('🧪 Testing Product Creation with Thumbnail Image...\n');

  try {
    // Create form data
    const formData = new FormData();
    
    // Add text fields
    formData.append('title', 'Premium Cotton Shirt with Thumbnail');
    formData.append('slug', 'premium-cotton-shirt-thumbnail');
    formData.append('description', 'High-quality cotton shirt with special thumbnail image for cart display');
    formData.append('shortDescription', 'Premium cotton shirt with custom thumbnail');
    formData.append('currentPrice', '1299');
    formData.append('originalPrice', '1999');
    formData.append('bestPrice', '1199');
    formData.append('category', 'men');
    formData.append('subCategory', 'shirts');
    formData.append('brand', 'PREMIUM');
    formData.append('model', 'PC-001');
    formData.append('sku', 'MEN-SHIRT-THUMB-001');
    formData.append('displayOrder', '1');
    formData.append('isActive', 'true');
    formData.append('isFeatured', 'true');
    formData.append('isNew', 'true');
    formData.append('stockQuantity', '25');
    formData.append('allowBackorder', 'false');
    formData.append('availableSizes', 'S,M,L,XL,XXL');
    formData.append('availableColors', JSON.stringify([
      { name: "Blue", code: "#0000FF", stockQuantity: 10 },
      { name: "White", code: "#FFFFFF", stockQuantity: 8 },
      { name: "Black", code: "#000000", stockQuantity: 7 }
    ]));
    formData.append('labels', 'PREMIUM,EXCLUSIVE');
    formData.append('tags', 'premium,cotton,shirt,comfortable');
    formData.append('keywords', 'premium cotton shirt, comfortable wear, high quality');
    formData.append('material', '100% Premium Cotton');
    formData.append('careInstructions', 'Machine wash cold, iron on low heat');
    formData.append('specifications', JSON.stringify([
      { name: "Material", value: "100% Premium Cotton" },
      { name: "Fit", value: "Slim Fit" },
      { name: "Sleeve", value: "Long Sleeve" },
      { name: "Collar", value: "Button Down" }
    ]));
    formData.append('metaTitle', 'Premium Cotton Shirt - PREMIUM');
    formData.append('metaDescription', 'High-quality cotton shirt with special thumbnail image for cart display');
    
    // Set thumbnail image index (0 = first image, 1 = second image, etc.)
    formData.append('thumbnailImageIndex', '1'); // Use second image as thumbnail

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
    for (let i = 1; i <= 4; i++) {
      const imagePath = path.join(process.cwd(), `test-image-${i}.jpg`);
      if (!fs.existsSync(imagePath)) {
        fs.copyFileSync(testImagePath, imagePath);
      }
      formData.append('images', fs.createReadStream(imagePath));
    }

    console.log('📤 Sending request with 4 test images and thumbnail index 1...');

    const response = await fetch(`${BASE_URL}/products/create`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${ADMIN_TOKEN}`,
        ...formData.getHeaders()
      },
      body: formData
    });

    console.log('📥 Response Status:', response.status);

    const responseData = await response.json();
    console.log('📥 Response Body:', JSON.stringify(responseData, null, 2));

    if (response.ok) {
      console.log('✅ Product with thumbnail created successfully!');
      console.log('📦 Product ID:', responseData.data._id);
      console.log('🖼️ Total Images:', responseData.data.images.length);
      console.log('🖼️ Thumbnail Image:', responseData.data.thumbnailImage);
      
      // Test getting the product to verify thumbnail
      console.log('\n🔍 Testing GET product to verify thumbnail...');
      const getResponse = await fetch(`${BASE_URL}/products/public/details/${responseData.data.slug}`);
      const getData = await getResponse.json();
      
      if (getResponse.ok) {
        console.log('✅ GET product successful!');
        console.log('🖼️ Thumbnail in GET response:', getData.data.thumbnailImage);
      } else {
        console.log('❌ GET product failed:', getData.message);
      }
    } else {
      console.log('❌ Product creation failed!');
      console.log('🚨 Error:', responseData.message);
    }

  } catch (error) {
    console.error('❌ Test failed with error:', error.message);
  }

  console.log('\n🎉 Product thumbnail test completed!');
}

// Run the test
testProductWithThumbnail(); 