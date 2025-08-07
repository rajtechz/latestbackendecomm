import express from 'express';
import multer from 'multer';
import {
  createTrendingCategory,
  getAllTrendingCategories,
  getSingleTrendingCategory,
  updateTrendingCategory,
  deleteTrendingCategory,
  getActiveTrendingCategories,
  getFeaturedTrendingCategories,
  getTrendingCategoriesByType,
  incrementClick,
  incrementImpression,
  getTrendingCategoriesStats,
  getPublicTrendingCategories,
  getUserTrendingCategories,
  getUserFeaturedTrendingCategories,
  getUserSingleTrendingCategory
} from '../../controllers/productController/trendingCategoryController.js';
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
    files: 1 // Only 1 image for trending category
  }
}).single('image');

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
          message: 'Too many files. Only 1 image allowed.',
          error: 'FILE_COUNT_LIMIT'
        });
      case 'LIMIT_UNEXPECTED_FILE':
        return res.status(400).json({
          success: false,
          message: 'Unexpected file field. Please use "image" field for file upload.',
          error: 'UNEXPECTED_FILE_FIELD',
          expectedField: 'image'
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
    if (req.method === 'POST' && (!req.file)) {
      return res.status(400).json({
        success: false,
        message: 'Category image is required for creating trending categories.',
        error: 'MISSING_IMAGE'
      });
    }
    
    // Validate file type if file is uploaded
    if (req.file && !req.file.mimetype.startsWith('image/')) {
      return res.status(400).json({
        success: false,
        message: 'Only image files are allowed. Please check your uploaded file.',
        error: 'INVALID_FILE_TYPE',
        invalidFile: req.file.originalname
      });
    }
    
    next();
  });
};

// ========================================
// ADMIN ROUTES (Authentication Required)
// ========================================

// Create trending category (Admin only)
router.post('/create', 
  isAuthenticated, 
  isAdmin, 
  handleFileUpload, 
  createTrendingCategory
);

// Get all trending categories (Admin)
router.get('/admin/all', isAuthenticated, isAdmin, getAllTrendingCategories);

// Get single trending category by ID (Admin)
router.get('/admin/:id', isAuthenticated, isAdmin, getSingleTrendingCategory);

// Update trending category (Admin)
router.put('/admin/:id', 
  isAuthenticated, 
  isAdmin, 
  handleFileUpload, 
  updateTrendingCategory
);

// Delete trending category (Admin)
router.delete('/admin/:id', isAuthenticated, isAdmin, deleteTrendingCategory);

// Get trending categories statistics (Admin)
router.get('/admin/stats', isAuthenticated, isAdmin, getTrendingCategoriesStats);

// ========================================
// PUBLIC ROUTES (No Authentication Required)
// ========================================

// Get all public trending categories
router.get('/public/all', getPublicTrendingCategories);

// Get active trending categories
router.get('/public/active', getActiveTrendingCategories);

// Get featured trending categories
router.get('/public/featured', getFeaturedTrendingCategories);

// Get trending categories by type
router.get('/public/type/:categoryType', getTrendingCategoriesByType);

// Get single trending category by ID (public)
router.get('/public/:id', getSingleTrendingCategory);

// Analytics tracking (public)
router.post('/:id/click', incrementClick);
router.post('/:id/impression', incrementImpression);

// ========================================
// USER ROUTES (Authentication Required - Read Only)
// ========================================

// Get all trending categories (User can read)
router.get('/user/all', isAuthenticated, getUserTrendingCategories);

// Get featured trending categories (User can read)
router.get('/user/featured', isAuthenticated, getUserFeaturedTrendingCategories);

// Get single trending category (User can read)
router.get('/user/:id', isAuthenticated, getUserSingleTrendingCategory);

export default router; 