import express from 'express';
import multer from 'multer';
import {
  createProduct,
  getAllProducts,
  getSingleProduct,
  updateProduct,
  deleteProduct,
  getProductsByCategory,
  getFeaturedProducts,
  getNewProducts,
  getProductsByLabels,
  searchProducts,
  getProductDetails,
  getRelatedProducts,
  incrementClick,
  incrementImpression,
  getProductStats,
  getPublicProducts,
  getUserProducts
} from '../../controllers/productController/productController.js';
import { isAuthenticated, isAdmin } from '../../middleware/authMiddleware.js';

const router = express.Router();

// Configure multer for image uploads
const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  // Accept images only
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed!'), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB per file
    files: 10 // Maximum 10 images per product
  }
}).array('images', 10);

// Handle multer errors
const handleMulterError = (error, req, res, next) => {
  console.log('Multer error:', error);
  
  if (error instanceof multer.MulterError) {
    switch (error.code) {
      case 'LIMIT_FILE_SIZE':
        return res.status(400).json({
          success: false,
          message: 'File too large. Maximum size is 10MB.',
          error: 'FILE_SIZE_LIMIT'
        });
      case 'LIMIT_FILE_COUNT':
        return res.status(400).json({
          success: false,
          message: 'Too many files. Maximum 10 images allowed per product.',
          error: 'FILE_COUNT_LIMIT'
        });
      case 'LIMIT_UNEXPECTED_FILE':
        return res.status(400).json({
          success: false,
          message: 'Unexpected file field. Please use "images" field for file upload.',
          error: 'UNEXPECTED_FILE_FIELD',
          expectedField: 'images'
        });
      default:
        return res.status(400).json({
          success: false,
          message: `File upload error: ${error.message}`,
          error: 'MULTER_ERROR',
          code: error.code
        });
    }
  }
  
  if (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
      error: 'VALIDATION_ERROR'
    });
  }
  
  next();
};

// Custom middleware to handle file upload with better error handling
const handleFileUpload = (req, res, next) => {
  upload(req, res, (err) => {
    if (err) {
      return handleMulterError(err, req, res, next);
    }
    
    // Validate image requirement for create operation
    if (req.method === 'POST' && (!req.files || req.files.length === 0)) {
      return res.status(400).json({
        success: false,
        message: 'At least one product image is required.',
        error: 'MISSING_IMAGES'
      });
    }
    
    // Validate file types if files are uploaded
    if (req.files && req.files.length > 0) {
      const invalidFiles = req.files.filter(file => !file.mimetype.startsWith('image/'));
      if (invalidFiles.length > 0) {
        return res.status(400).json({
          success: false,
          message: 'Only image files are allowed. Please check your uploaded files.',
          error: 'INVALID_FILE_TYPE',
          invalidFiles: invalidFiles.map(file => file.originalname)
        });
      }
    }
    
    // Add debug logging
    console.log('Files received:', req.files ? req.files.length : 0);
    if (req.files && req.files.length > 0) {
      console.log('File names:', req.files.map(f => f.originalname));
    }
    
    next();
  });
};

// ========================================
// ADMIN ROUTES (Authentication Required)
// ========================================

// Create product (Admin only)
router.post('/create', 
  isAuthenticated, 
  isAdmin, 
  handleFileUpload, 
  createProduct
);

// Get all products (Admin)
router.get('/admin/all', isAuthenticated, isAdmin, getAllProducts);

// Get single product by ID (Admin)
router.get('/admin/:id', isAuthenticated, isAdmin, getSingleProduct);

// Update product (Admin)
router.put('/admin/:id', 
  isAuthenticated, 
  isAdmin, 
  handleFileUpload, 
  updateProduct
);

// Delete product (Admin)
router.delete('/admin/:id', isAuthenticated, isAdmin, deleteProduct);

// Get product statistics (Admin)
router.get('/admin/stats', isAuthenticated, isAdmin, getProductStats);

// ========================================
// PUBLIC ROUTES (No Authentication Required)
// ========================================

// Get all public products
router.get('/public/all', getPublicProducts);

// Get products by category (e.g., /products/men, /products/women)
router.get('/public/category/:category', getProductsByCategory);

// Get featured products
router.get('/public/featured', getFeaturedProducts);

// Get new products
router.get('/public/new', getNewProducts);

// Get products by labels (e.g., /products/labels/NEW DROP,EXCLUSIVE)
router.get('/public/labels/:labels', getProductsByLabels);

// Search products
router.get('/public/search', searchProducts);

// Get product details by slug (for product page)
router.get('/public/details/:slug', getProductDetails);

// Get product details by ID (for public access)
router.get('/public/:id', getSingleProduct);

// Get related products
router.get('/public/related/:productId', getRelatedProducts);

// Analytics tracking (public)
router.post('/:id/click', incrementClick);
router.post('/:id/impression', incrementImpression);

// ========================================
// USER ROUTES (Authentication Required - Read Only)
// ========================================

// Get all products (User can read)
router.get('/user/all', isAuthenticated, getUserProducts);

// Get products by category (User)
router.get('/user/category/:category', isAuthenticated, getProductsByCategory);

// Get featured products (User)
router.get('/user/featured', isAuthenticated, getFeaturedProducts);

// Get new products (User)
router.get('/user/new', isAuthenticated, getNewProducts);

// Search products (User)
router.get('/user/search', isAuthenticated, searchProducts);

// Get product details (User)
router.get('/user/details/:slug', isAuthenticated, getProductDetails);

// ========================================
// CATEGORY-SPECIFIC ROUTES (Public)
// ========================================

// Men's products
router.get('/men', getProductsByCategory);
router.get('/men/featured', getFeaturedProducts);
router.get('/men/new', getNewProducts);

// Women's products
router.get('/women', getProductsByCategory);
router.get('/women/featured', getFeaturedProducts);
router.get('/women/new', getNewProducts);

// Kids' products
router.get('/kids', getProductsByCategory);
router.get('/kids/featured', getFeaturedProducts);
router.get('/kids/new', getNewProducts);

// Furniture products
router.get('/furniture', getProductsByCategory);
router.get('/furniture/featured', getFeaturedProducts);
router.get('/furniture/new', getNewProducts);

// Electronics products
router.get('/electronics', getProductsByCategory);
router.get('/electronics/featured', getFeaturedProducts);
router.get('/electronics/new', getNewProducts);

// Beauty products
router.get('/beauty', getProductsByCategory);
router.get('/beauty/featured', getFeaturedProducts);
router.get('/beauty/new', getNewProducts);

// Fashion products
router.get('/fashion', getProductsByCategory);
router.get('/fashion/featured', getFeaturedProducts);
router.get('/fashion/new', getNewProducts);

// Sport products
router.get('/sport', getProductsByCategory);
router.get('/sport/featured', getFeaturedProducts);
router.get('/sport/new', getNewProducts);

export default router;
