# 🎯 Valid Enum Values Guide

## **🚨 Your Current Error:**
```
"Product validation failed: labels.2: `PREMIUM` is not a valid enum value for path `labels.2`."
```

**The issue:** `PREMIUM` is not a valid enum value for the `labels` field.

---

## **✅ Valid Enum Values**

### **📋 Labels (Product Badges):**
```
✅ Valid: NEW DROP, EXCLUSIVE, BESTSELLER, LIMITED, SALE, TRENDING, FEATURED
❌ Invalid: PREMIUM, PREMIUM QUALITY, NEW, HOT, POPULAR
```

### **📋 Available Sizes:**
```
✅ Valid: XS, S, M, L, XL, XXL, XXXL, ONE_SIZE, 28, 30, 32, 34, 36, 38, 40, 42, 44, 46
❌ Invalid: XS, S, M, L, XL, XXL, XXXL (with spaces)
```

---

## **🔧 Quick Fix**

### **❌ What you're probably sending:**
```
labels: NEW DROP,EXCLUSIVE,PREMIUM
```

### **✅ Correct format:**
```
labels: NEW DROP,EXCLUSIVE,BESTSELLER
```

---

## **📝 Complete Correct Form Data:**

### **Basic Information:**
```
title: Classic White T-Shirt
slug: gray-shirt
description: Premium quality classic white t-shirt
currentPrice: 899
originalPrice: 1499
category: men
brand: CARTUNO
```

### **Array Fields (Use ONLY valid enum values):**
```
availableSizes: S,M,L,XL,XXL
labels: NEW DROP,EXCLUSIVE,BESTSELLER
tags: classic,white,t-shirt,comfortable
keywords: classic white t-shirt, comfortable wear, premium quality
```

### **JSON Fields:**
```
availableColors: [{"name":"White","code":"#FFFFFF","stockQuantity":20},{"name":"Black","code":"#000000","stockQuantity":15}]
specifications: [{"name":"Material","value":"100% Cotton"},{"name":"Fit","value":"Regular Fit"}]
```

### **File Field:**
```
images: [Select your image files]
```

---

## **🎯 All Valid Values Reference**

### **Labels (Product Badges):**
| Value | Description |
|-------|-------------|
| `NEW DROP` | New product releases |
| `EXCLUSIVE` | Limited edition items |
| `BESTSELLER` | Popular products |
| `LIMITED` | Limited quantity items |
| `SALE` | Items on sale |
| `TRENDING` | Currently popular |
| `FEATURED` | Highlighted products |

### **Available Sizes:**
| Value | Description |
|-------|-------------|
| `XS` | Extra Small |
| `S` | Small |
| `M` | Medium |
| `L` | Large |
| `XL` | Extra Large |
| `XXL` | Double Extra Large |
| `XXXL` | Triple Extra Large |
| `ONE_SIZE` | One size fits all |
| `28`, `30`, `32`, `34`, `36`, `38`, `40`, `42`, `44`, `46` | Numeric sizes |

---

## **🔧 Common Mistakes & Fixes**

### **❌ Mistake 1: Using invalid enum values**
```
❌ Wrong: labels: NEW DROP,EXCLUSIVE,PREMIUM
✅ Correct: labels: NEW DROP,EXCLUSIVE,BESTSELLER
```

### **❌ Mistake 2: Using spaces in enum values**
```
❌ Wrong: labels: NEW DROP, EXCLUSIVE, BESTSELLER
✅ Correct: labels: NEW DROP,EXCLUSIVE,BESTSELLER
```

### **❌ Mistake 3: Using lowercase values**
```
❌ Wrong: labels: new drop,exclusive,bestseller
✅ Correct: labels: NEW DROP,EXCLUSIVE,BESTSELLER
```

### **❌ Mistake 4: Using custom values**
```
❌ Wrong: labels: PREMIUM QUALITY,TOP RATED,HOT SELLER
✅ Correct: labels: FEATURED,BESTSELLER,TRENDING
```

---

## **📋 Complete Working Example**

### **Postman Form Data:**
```
title: Classic White T-Shirt
slug: gray-shirt
description: Premium quality classic white t-shirt with comfortable fit
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
material: 100% Cotton
careInstructions: Machine wash cold, tumble dry low
metaTitle: Classic White T-Shirt - CARTUNO
metaDescription: Premium quality classic white t-shirt
thumbnailImageIndex: 0
availableSizes: S,M,L,XL,XXL
labels: NEW DROP,EXCLUSIVE,BESTSELLER
tags: classic,white,t-shirt,comfortable
keywords: classic white t-shirt, comfortable wear, premium quality
availableColors: [{"name":"White","code":"#FFFFFF","stockQuantity":20},{"name":"Black","code":"#000000","stockQuantity":15}]
specifications: [{"name":"Material","value":"100% Cotton"},{"name":"Fit","value":"Regular Fit"}]
images: [Select your image files]
```

### **Expected Success Response:**
```json
{
  "success": true,
  "data": {
    "_id": "generated-product-id",
    "title": "Classic White T-Shirt",
    "slug": "gray-shirt",
    "labels": ["NEW DROP", "EXCLUSIVE", "BESTSELLER"],
    "availableSizes": ["S", "M", "L", "XL", "XXL"],
    "isActive": true,
    "isFeatured": true,
    "isNew": true
  },
  "message": "Product created successfully by admin"
}
```

---

## **✅ Success Checklist:**

- [ ] Use only valid enum values for `labels`
- [ ] Use only valid enum values for `availableSizes`
- [ ] No spaces after commas
- [ ] Use uppercase for enum values
- [ ] No custom/invalid values
- [ ] Proper JSON format for complex objects
- [ ] Images uploaded correctly

---

**🎉 Use only the valid enum values listed above and your product creation will work perfectly!**
