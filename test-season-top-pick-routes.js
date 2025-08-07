import express from 'express';

console.log('🔍 Testing Season Top Pick Routes...');

try {
  // Test importing the routes
  const seasonTopPickRoutes = await import('./routes/products/seasonTopPickRoutes.js');
  console.log('✅ Season Top Pick Routes imported successfully!');
  
  // Test creating a router instance
  const app = express();
  app.use('/test', seasonTopPickRoutes.default);
  console.log('✅ Router instance created successfully!');
  
  console.log('🎉 All tests passed! The routes should work correctly.');
  
} catch (error) {
  console.error('❌ Error:', error.message);
  console.error('Stack trace:', error.stack);
} 