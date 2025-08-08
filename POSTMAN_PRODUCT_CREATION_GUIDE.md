# 🛍️ Postman Product Creation Guide

## **🔧 Fixed Issues**

The `"availableSizes.split is not a function"` error has been resolved! The API now handles both string and array inputs for all array fields.

---

## **📋 Product Creation Steps**

### **🔗 Endpoint:**
```
POST http://localhost:8000/api/products/create
```

### **🔐 Headers:**
```
Authorization: Bearer YOUR_ADMIN_TOKEN
Content-Type: multipart/form-data (Postman sets this automatically)
```

---

## **📝 Form Data Fields**

### **✅ Text Fields (Required):**

| Key | Value | Example |
|-----|-------|---------|
| `title` | Product title | `Classic White T-Shirt` |
| `slug` | URL-friendly name | `classic-white-t-shirt` |
| `currentPrice` | Current selling price | `899` |
| `category` | Product category | `men` |
| `brand` | Brand name | `CARTUNO` |
| `sku` | Unique product code | `MEN-TSHIRT-001` |

### **✅ Text Fields (Optional):**

| Key | Value | Example |
|-----|-------|---------|
| `description` | Full description | `Premium quality classic white t-shirt...` |
| `shortDescription` | Brief description | `Comfortable and stylish classic white t-shirt` |
| `originalPrice` | Original price | `1499` |
| `bestPrice` | Best price | `799` |
| `subCategory` | Sub-category | `t-shirts` |
| `model` | Model number | `CW-001` |
| `displayOrder` | Display order | `1` |
| `isActive` | Active status | `true` |
| `isFeatured` | Featured status | `true` |
| `isNew` | New product status | `true` |
| `stockQuantity` | Stock quantity | `50` |
| `allowBackorder` | Allow backorder | `false` |
| `material` | Material description | `100% Cotton` |
| `careInstructions` | Care instructions | `Machine wash cold, tumble dry low` |
| `metaTitle` | SEO title | `Classic White T-Shirt - CARTUNO` |
| `metaDescription` | SEO description | `Premium quality classic white t-shirt...` |
| `thumbnailImageIndex` | Thumbnail image index | `0` |

---

## **🔄 Array Fields - Multiple Input Methods**

### **Method 1: Comma-Separated String (Recommended)**
```
availableSizes: S,M,L,XL,XXL
labels: NEW DROP,EXCLUSIVE
tags: classic,white,t-shirt,comfortable
keywords: classic white t-shirt, comfortable wear, premium quality
```

### **Method 2: JSON String**
```
availableColors: [{"name":"White","code":"#FFFFFF","stockQuantity":20},{"name":"Black","code":"#000000","stockQuantity":15}]
specifications: [{"name":"Material","value":"100% Cotton"},{"name":"Fit","value":"Regular Fit"}]
```

### **Method 3: Array (Postman will handle this automatically)**
Postman may send some fields as arrays, which is now supported.

---

## **📋 Complete Example**

### **🔗 Request Setup:**
- **Method:** `POST`
- **URL:** `http://localhost:8000/api/products/create`
- **Body:** `form-data`

### **📝 Form Data:**

#### **Basic Information:**
```
title: Classic White T-Shirt
slug: classic-white-t-shirt
description: Premium quality classic white t-shirt with comfortable fit and durable material. Perfect for everyday wear.
shortDescription: Comfortable and stylish classic white t-shirt
currentPrice: 899
originalPrice: 1499
bestPrice: 799
category: men
subCategory: t-shirts
brand: CARTUNO
model: CW-001
sku: MEN-TSHIRT-001
displayOrder: 1
isActive: true
isFeatured: true
isNew: true
stockQuantity: 50
allowBackorder: false
```

#### **Array Fields (String Format):**
```
availableSizes: S,M,L,XL,XXL
labels: NEW DROP,EXCLUSIVE
tags: classic,white,t-shirt,comfortable
keywords: classic white t-shirt, comfortable wear, premium quality
```

#### **JSON Fields:**
```
availableColors: [{"name":"White","code":"#FFFFFF","stockQuantity":20},{"name":"Black","code":"#000000","stockQuantity":15},{"name":"Navy","code":"#000080","stockQuantity":15}]
specifications: [{"name":"Material","value":"100% Cotton"},{"name":"Fit","value":"Regular Fit"},{"name":"Sleeve","value":"Short Sleeve"},{"name":"Neck","value":"Round Neck"}]
```

#### **Additional Fields:**
```
material: 100% Cotton
careInstructions: Machine wash cold, tumble dry low
metaTitle: Classic White T-Shirt - CARTUNO
metaDescription: Premium quality classic white t-shirt with comfortable fit and durable material
thumbnailImageIndex: 0
```

#### **File Field:**
```
images: [Select your image files]
```

### **🔐 Headers:**
```
Authorization: Bearer YOUR_ADMIN_TOKEN
```

---

## **🎯 Expected Response:**

```json
{
  "success": true,
  "data": {
    "_id": "generated-product-id",
    "title": "Classic White T-Shirt",
    "slug": "classic-white-t-shirt",
    "currentPrice": 899,
    "originalPrice": 1499,
    "discountPercentage": 40,
    "category": "men",
    "brand": "CARTUNO",
    "images": [
      {
        "url": "https://your-s3-bucket.s3.amazonaws.com/products/men/image1.jpg",
        "alt": "Classic White T-Shirt image 1",
        "order": 0,
        "isPrimary": true
      }
    ],
    "thumbnailImage": {
      "url": "https://your-s3-bucket.s3.amazonaws.com/products/men/image1.jpg",
      "alt": "Classic White T-Shirt image 1"
    },
    "availableSizes": ["S", "M", "L", "XL", "XXL"],
    "availableColors": [
      {
        "name": "White",
        "code": "#FFFFFF",
        "stockQuantity": 20
      }
    ],
    "labels": ["NEW DROP", "EXCLUSIVE"],
    "tags": ["classic", "white", "t-shirt", "comfortable"],
    "keywords": ["classic white t-shirt", "comfortable wear", "premium quality"],
    "isActive": true,
    "isFeatured": true,
    "isNew": true
  },
  "message": "Product created successfully by admin"
}
```

---

## **🔧 Troubleshooting**

### **❌ Common Errors & Solutions:**

1. **"availableSizes.split is not a function"**
   - ✅ **FIXED:** The API now handles both string and array inputs
   - Use comma-separated string: `S,M,L,XL,XXL`

2. **"At least one product image is required"**
   - ✅ **Solution:** Add image files to the `images` field
   - Select multiple files in Postman

3. **"Product with this slug already exists"**
   - ✅ **Solution:** Change the `slug` to a unique value
   - Example: `classic-white-t-shirt-2`

4. **"Access denied. Only administrators can create products"**
   - ✅ **Solution:** Use a valid admin token in Authorization header

5. **JSON parsing errors**
   - ✅ **FIXED:** The API now handles JSON parsing errors gracefully
   - Check your JSON format for `availableColors` and `specifications`

---

## **🎨 Thumbnail Image Feature**

### **📸 Thumbnail Index:**
- `thumbnailImageIndex: 0` → Use first image as thumbnail
- `thumbnailImageIndex: 1` → Use second image as thumbnail
- `thumbnailImageIndex: 2` → Use third image as thumbnail
- **No index provided** → Automatically uses first image

### **🖼️ Image Requirements:**
- **Format:** JPG, PNG, WebP
- **Size:** Up to 10MB per image
- **Count:** Up to 10 images per product
- **Quality:** High resolution recommended

---

## **🚀 Quick Test Commands:**

### **cURL Example:**
```bash
curl -X POST http://localhost:8000/api/products/create \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -F "title=Test Product" \
  -F "slug=test-product" \
  -F "description=Test description" \
  -F "currentPrice=999" \
  -F "category=men" \
  -F "brand=TEST" \
  -F "availableSizes=S,M,L,XL" \
  -F "labels=NEW DROP,EXCLUSIVE" \
  -F "images=@/path/to/image1.jpg" \
  -F "images=@/path/to/image2.jpg"
```

### **JavaScript Example:**
```javascript
const formData = new FormData();
formData.append('title', 'Test Product');
formData.append('slug', 'test-product');
formData.append('currentPrice', '999');
formData.append('category', 'men');
formData.append('availableSizes', 'S,M,L,XL');
formData.append('labels', 'NEW DROP,EXCLUSIVE');
// Add images and other fields...

fetch('http://localhost:8000/api/products/create', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer YOUR_ADMIN_TOKEN'
  },
  body: formData
});
```

---

## **✅ Success Checklist:**

- [ ] Admin token provided in Authorization header
- [ ] All required fields filled
- [ ] Images uploaded to `images` field
- [ ] Array fields in correct format (comma-separated or JSON)
- [ ] Unique slug provided
- [ ] Valid category selected
- [ ] Price fields as numbers
- [ ] Boolean fields as `true`/`false` strings

---

**🎉 The API now handles all input formats robustly! No more parsing errors!** 