import express from 'express';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

console.log('🔍 Testing server imports...');

try {
  // Test importing all the required modules
  console.log('📦 Testing route imports...');
  
  const userRoutes = await import('./routes/user/userRoutes.js');
  console.log('✅ User routes imported');
  
  const adminRoutes = await import('./routes/admin/adminRoute.js');
  console.log('✅ Admin routes imported');
  
  const productRoutes = await import('./routes/products/productRoutes.js');
  console.log('✅ Product routes imported');
  
  const bannerRoutes = await import('./routes/admin/bannerRoutes.js');
  console.log('✅ Banner routes imported');
  
  const newArrivalRoutes = await import('./routes/products/newArrivalRoutes.js');
  console.log('✅ New arrival routes imported');
  
  const seasonTopPickRoutes = await import('./routes/products/seasonTopPickRoutes.js');
  console.log('✅ Season top pick routes imported');
  
  const cartRoutes = await import('./routes/cartRoutes.js');
  console.log('✅ Cart routes imported');
  
  console.log('✅ All routes imported successfully!');
  
  // Test importing controllers
  console.log('📦 Testing controller imports...');
  
  const seasonTopPickController = await import('./controllers/productController/seasonTopPickController.js');
  console.log('✅ Season top pick controller imported');
  
  // Test importing models
  console.log('📦 Testing model imports...');
  
  const SeasonTopPick = await import('./models/product/SeasonTopPick.js');
  console.log('✅ Season top pick model imported');
  
  const Product = await import('./models/product/Product.js');
  console.log('✅ Product model imported');
  
  // Test importing middleware
  console.log('📦 Testing middleware imports...');
  
  const authMiddleware = await import('./middleware/authMiddleware.js');
  console.log('✅ Auth middleware imported');
  
  console.log('✅ All imports successful!');
  console.log('🚀 Server should start without errors');
  
} catch (error) {
  console.error('❌ Import error:', error.message);
  console.error('Stack trace:', error.stack);
} 