# Postman Error Guide for New Arrival API

## ✅ **Updated API Requirements**

### **productId is now OPTIONAL**
- You can create new arrivals without referencing an existing product
- If you provide a `productId`, it will link to an existing product
- If you don't provide `productId`, it creates a standalone new arrival

## 🔍 **Common Errors and Solutions**

### **1. "Unexpected file field" Error**
```json
{
  "success": false,
  "message": "Unexpected file field. Please ensure all file fields are named \"images\".",
  "error": "UNEXPECTED_FILE_FIELD",
  "expectedField": "images"
}
```

**Cause:** You have multiple file fields in your request.

**Solution:**
- ✅ Use ONLY the `images` field for file uploads
- ❌ Remove any other file fields like `featuredImage`
- ✅ Upload 3-10 image files under the `images` field

### **2. "Product ID is required" Error**
```json
{
  "success": false,
  "message": "Product ID is required"
}
```

**Cause:** This error should no longer occur as `productId` is now optional.

**Solution:**
- ✅ You can now create new arrivals without providing a `productId`
- ✅ If you want to link to an existing product, provide a valid `productId`

### **3. "Minimum 3 images are required" Error**
```json
{
  "success": false,
  "message": "Minimum 3 images are required for new arrivals. Please upload at least 3 images.",
  "error": "INSUFFICIENT_IMAGES",
  "required": 3,
  "provided": 2
}
```

**Cause:** You uploaded fewer than 3 images.

**Solution:**
- ✅ Upload at least 3 images (maximum 10)
- ✅ All files must be image files (JPG, PNG, GIF)

### **4. "File too large" Error**
```json
{
  "success": false,
  "message": "File too large. Maximum size is 10MB per image.",
  "error": "FILE_SIZE_LIMIT"
}
```

**Cause:** One or more image files exceed 10MB.

**Solution:**
- ✅ Compress your images to under 10MB each
- ✅ Use image optimization tools if needed

## ✅ **Correct Postman Setup**

### **Request Configuration:**
- **Method:** `POST`
- **URL:** `http://localhost:8000/api/products/new-arrival`
- **Content-Type:** `multipart/form-data` (automatic)

### **Authentication:**
- **Headers:** `Authorization: Bearer YOUR_JWT_TOKEN`

### **Form Data Fields:**

#### **Optional Fields:**
```
productId: [VALID_PRODUCT_ID] (optional - can be left empty)
```

#### **Required File Upload:**
```
images: [Select 3-10 image files] (Field name MUST be "images")
```

#### **Product Details (Required if no productId):**
```
title: "Your Product Title"
description: "Your product description"
currentPrice: 895
originalPrice: 1399
discountPercentage: 36
bestPrice: 859
brand: "Your Brand"
color: "Red"
material: "Cotton"
```

#### **Optional Fields:**
```
rating: 4.5
numReviews: 128
tags: "summer,casual,trending"
adminNotes: "Admin notes here"
```

## 🚀 **Example Request**

**Text Fields:**
```
title: Heavy GSM Printed Monster T-Shirt | Red
description: Premium quality heavy GSM cotton t-shirt with monster print design
currentPrice: 895
originalPrice: 1399
discountPercentage: 36
bestPrice: 859
brand: Monster Brand
color: Red
material: Heavy GSM Cotton
rating: 4.5
numReviews: 128
tags: summer,casual,trending
adminNotes: Featured product for summer collection
```

**File Fields:**
```
images: [Select 3-10 image files]
```

## ⚠️ **Important Notes**

1. **No `productId` required** - You can create standalone new arrivals
2. **Only use `images` field** for file uploads
3. **Minimum 3 images** required
4. **Maximum 10 images** allowed
5. **10MB per image** size limit
6. **Image files only** (JPG, PNG, GIF)

## 🔧 **Troubleshooting Steps**

1. **Check file field names** - Only use `images`
2. **Verify image count** - 3-10 images required
3. **Check file sizes** - Under 10MB each
4. **Validate file types** - Images only
5. **Ensure authentication** - Valid admin token required
6. **Check server connection** - Verify API endpoint

## 📞 **Need Help?**

If you're still experiencing issues:
1. Check the server logs for detailed error messages
2. Verify your authentication token is valid
3. Ensure all required fields are provided
4. Test with the provided HTML interface for easier debugging 