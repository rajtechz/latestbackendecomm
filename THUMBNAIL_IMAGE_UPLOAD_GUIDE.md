# Thumbnail Image Upload Guide

Your product creation API now supports **separate thumbnail image uploads** while keeping the existing product images input unchanged.

## What Changed

- **Before**: Thumbnail was automatically selected from product images using `thumbnailImageIndex`
- **Now**: Thumbnail can be uploaded separately using a dedicated `thumbnailImage` field
- **Fallback**: If no thumbnail is uploaded, the first product image becomes the thumbnail

## API Endpoint

```
POST http://localhost:8000/api/products/create
Content-Type: multipart/form-data
Authorization: Bearer YOUR_JWT_TOKEN
```

## Form Fields Structure

### Required Fields
```
title: Product Title
slug: product-slug
currentPrice: 29.99
category: fashion
images: [file1.jpg, file2.jpg, file3.jpg]  ← Product images
```

### Optional Fields
```
thumbnailImage: [thumbnail.jpg]  ← Separate thumbnail image
thumbnailAlt: Custom thumbnail alt text
description: Product description
brand: Brand name
sku: Product SKU
... (other product fields)
```

## Upload Methods

### Method 1: Postman

1. **Set Request Type**: `POST` with `form-data`
2. **Add Fields**:

**Text Fields:**
```
title: Premium Cotton T-Shirt
slug: premium-cotton-tshirt
description: High-quality cotton t-shirt...
currentPrice: 29.99
category: fashion
brand: Fashion Brand
sku: TSHIRT-001
```

**File Fields:**
```
images: [Select multiple product images]
thumbnailImage: [Select single thumbnail image]
```

### Method 2: HTML Form

```html
<form action="http://localhost:8000/api/products/create" method="POST" enctype="multipart/form-data">
    <input type="text" name="title" value="Premium Cotton T-Shirt" required>
    <input type="text" name="slug" value="premium-cotton-tshirt" required>
    <input type="number" name="currentPrice" value="29.99" step="0.01" required>
    <select name="category" required>
        <option value="fashion">Fashion</option>
        <option value="electronics">Electronics</option>
    </select>
    
    <!-- Product Images (Multiple) -->
    <input type="file" name="images" multiple accept="image/*" required>
    
    <!-- Thumbnail Image (Single) -->
    <input type="file" name="thumbnailImage" accept="image/*">
    
    <button type="submit">Create Product</button>
</form>
```

### Method 3: JavaScript/Fetch

```javascript
const formData = new FormData();

// Add text fields
formData.append('title', 'Premium Cotton T-Shirt');
formData.append('slug', 'premium-cotton-tshirt');
formData.append('currentPrice', '29.99');
formData.append('category', 'fashion');

// Add product images (multiple)
const productImages = document.querySelector('input[name="images"]').files;
for (let i = 0; i < productImages.length; i++) {
    formData.append('images', productImages[i]);
}

// Add thumbnail image (single)
const thumbnailImage = document.querySelector('input[name="thumbnailImage"]').files[0];
if (thumbnailImage) {
    formData.append('thumbnailImage', thumbnailImage);
}

// Send request
fetch('http://localhost:8000/api/products/create', {
    method: 'POST',
    body: formData,
    headers: {
        'Authorization': 'Bearer YOUR_JWT_TOKEN'
    }
})
.then(response => response.json())
.then(data => console.log(data));
```

### Method 4: cURL

```bash
curl -X POST http://localhost:8000/api/products/create \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -F "title=Premium Cotton T-Shirt" \
  -F "slug=premium-cotton-tshirt" \
  -F "currentPrice=29.99" \
  -F "category=fashion" \
  -F "brand=Fashion Brand" \
  -F "images=@/path/to/product1.jpg" \
  -F "images=@/path/to/product2.jpg" \
  -F "images=@/path/to/product3.jpg" \
  -F "thumbnailImage=@/path/to/thumbnail.jpg"
```

### Method 5: Python Requests

```python
import requests

url = "http://localhost:8000/api/products/create"
headers = {"Authorization": "Bearer YOUR_JWT_TOKEN"}

data = {
    "title": "Premium Cotton T-Shirt",
    "slug": "premium-cotton-tshirt",
    "currentPrice": "29.99",
    "category": "fashion",
    "brand": "Fashion Brand"
}

files = [
    ("images", ("product1.jpg", open("product1.jpg", "rb"), "image/jpeg")),
    ("images", ("product2.jpg", open("product2.jpg", "rb"), "image/jpeg")),
    ("images", ("product3.jpg", open("product3.jpg", "rb"), "image/jpeg")),
    ("thumbnailImage", ("thumbnail.jpg", open("thumbnail.jpg", "rb"), "image/jpeg"))
]

response = requests.post(url, data=data, files=files, headers=headers)
print(response.json())
```

## Complete Test Example

### Postman Setup

**Headers:**
```
Authorization: Bearer YOUR_JWT_TOKEN
```

**Body (form-data):**
```
title: Premium Cotton T-Shirt
slug: premium-cotton-tshirt
description: High-quality 100% cotton t-shirt with a comfortable fit. Perfect for everyday wear and casual occasions.
shortDescription: Comfortable cotton t-shirt for daily wear
currentPrice: 29.99
originalPrice: 39.99
category: fashion
subCategory: clothing
brand: Fashion Brand
model: TS-001
sku: TSHIRT-001
displayOrder: 1
isActive: true
isFeatured: true
isNew: true
stockQuantity: 100
allowBackorder: false
availableSizes: ["XS", "S", "M", "L", "XL", "XXL"]
labels: ["NEW DROP", "BESTSELLER"]
tags: ["cotton", "t-shirt", "casual", "comfortable"]
material: 100% Cotton
careInstructions: Machine wash cold, tumble dry low
images: [Select 3-5 product images]
thumbnailImage: [Select 1 thumbnail image]
```

## How It Works

1. **Product Images**: Uploaded via `images` field (multiple files)
   - First image automatically becomes primary
   - All images are stored in `products/{category}/` folder
   - Used for product gallery, carousel, etc.

2. **Thumbnail Image**: Uploaded via `thumbnailImage` field (single file)
   - Stored in `products/{category}/thumbnails/` folder
   - Used for cart display, quick previews, etc.
   - If not provided, first product image becomes thumbnail

3. **Fallback Behavior**: 
   - If no thumbnail uploaded → First product image becomes thumbnail
   - If no product images → API returns error
   - If no thumbnail but has product images → First product image becomes thumbnail

## File Requirements

### Product Images (`images`)
- **Quantity**: Minimum 1, maximum unlimited
- **Format**: JPG, JPEG, PNG, GIF, WEBP
- **Size**: Maximum 5MB per image
- **Usage**: Product gallery, detailed views

### Thumbnail Image (`thumbnailImage`)
- **Quantity**: 0 or 1 (optional)
- **Format**: JPG, JPEG, PNG, GIF, WEBP
- **Size**: Maximum 5MB
- **Usage**: Cart, quick previews, thumbnails

## Response Structure

```json
{
  "success": true,
  "data": {
    "title": "Premium Cotton T-Shirt",
    "images": [
      {
        "url": "https://s3.amazonaws.com/bucket/products/fashion/image1.jpg",
        "alt": "Premium Cotton T-Shirt image 1",
        "order": 0,
        "isPrimary": true
      },
      {
        "url": "https://s3.amazonaws.com/bucket/products/fashion/image2.jpg",
        "alt": "Premium Cotton T-Shirt image 2",
        "order": 1,
        "isPrimary": false
      }
    ],
    "thumbnailImage": {
      "url": "https://s3.amazonaws.com/bucket/products/fashion/thumbnails/thumbnail.jpg",
      "alt": "Premium Cotton T-Shirt thumbnail"
    }
  },
  "message": "Product created successfully by admin"
}
```

## Benefits

1. **Better Organization**: Thumbnail and product images are separate
2. **Optimized Thumbnails**: Thumbnail can be specifically sized/optimized
3. **Flexible Workflow**: Can upload thumbnail independently
4. **Backward Compatible**: Still works if no thumbnail provided
5. **Better Performance**: Thumbnail loads faster for cart/previews

## Testing Tips

1. **Test with thumbnail**: Upload both product images and thumbnail
2. **Test without thumbnail**: Upload only product images (should work)
3. **Test file types**: Try different image formats
4. **Test file sizes**: Ensure within 5MB limit
5. **Verify storage**: Check S3 folders for proper organization

## Common Issues

1. **No images error**: Ensure at least one product image is uploaded
2. **File size error**: Keep images under 5MB
3. **Format error**: Use only supported image formats
4. **Authorization error**: Include valid JWT token

The API now gives you full control over both product images and thumbnail while maintaining backward compatibility!
