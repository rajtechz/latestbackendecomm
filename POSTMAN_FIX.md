# 🔧 Quick Postman Fix

## **🚨 Your Current Error:**
```
"availableColors: Cast to embedded failed for value \"[{...}]\" (type string)"
"labels.0: `NEW DROP, EXCLUSIVE` is not a valid enum value"
"availableSizes.0: `S,M,L,XL,XXL` is not a valid enum value"
```

## **✅ Quick Fix:**

### **1. Remove spaces after commas:**
```
❌ Wrong: labels: NEW DROP, EXCLUSIVE
✅ Correct: labels: NEW DROP,EXCLUSIVE
```

### **2. Use proper JSON format:**
```
❌ Wrong: availableColors: {"name":"White","code":"#FFFFFF"}
✅ Correct: availableColors: [{"name":"White","code":"#FFFFFF"}]
```

### **3. Don't duplicate fields:**
```
❌ Wrong: 
title: Classic White T-Shirt
title: Premium Denim Jeans

✅ Correct:
title: Classic White T-Shirt
```

## **📝 Correct Form Data:**

```
title: Classic White T-Shirt
slug: gray-shirt
description: Premium quality classic white t-shirt
currentPrice: 899
originalPrice: 1499
category: men
brand: CARTUNO
availableSizes: S,M,L,XL,XXL
labels: NEW DROP,EXCLUSIVE
availableColors: [{"name":"White","code":"#FFFFFF","stockQuantity":20},{"name":"Black","code":"#000000","stockQuantity":15}]
specifications: [{"name":"Material","value":"100% Cotton"},{"name":"Fit","value":"Regular Fit"}]
images: [Select your image files]
```

**🎉 This should fix your validation errors!**
