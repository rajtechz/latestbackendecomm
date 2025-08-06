import express from 'express';
import multer from 'multer';
import {
  createNewArrival,
  getAllNewArrivals,
  getSingleNewArrival,
  updateNewArrival,
  deleteNewArrival,
  getActiveNewArrivals,
  getFeaturedNewArrivals,
  getNewArrivalsByCategory,
  getPublicNewArrivals,
  incrementImpression,
  incrementClick,
  bulkUpdateNewArrivals,
  getNewArrivalsStats
} from '../../controllers/productController/newArrivalController.js';
import { isAdmin, isAuthenticated } from '../../middleware/authMiddleware.js';

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
    files: 10 // Maximum 10 images
  }
}).array('images', 10); // Explicitly specify the field name and max files

// Handle multer errors
const handleMulterError = (error, req, res, next) => {
  console.log('Multer error:', error);
  
  if (error instanceof multer.MulterError) {
    switch (error.code) {
      case 'LIMIT_FILE_SIZE':
        return res.status(400).json({
          success: false,
          message: 'File too large. Maximum size is 10MB per image.',
          error: 'FILE_SIZE_LIMIT'
        });
      case 'LIMIT_FILE_COUNT':
        return res.status(400).json({
          success: false,
          message: 'Too many files. Maximum 10 images allowed.',
          error: 'FILE_COUNT_LIMIT'
        });
      case 'LIMIT_UNEXPECTED_FILE':
        return res.status(400).json({
          success: false,
          message: 'Unexpected file field. Please ensure all file fields are named "images".',
          error: 'UNEXPECTED_FILE_FIELD',
          expectedField: 'images'
        });
      case 'LIMIT_FIELD_KEY':
        return res.status(400).json({
          success: false,
          message: 'Too many fields. Please reduce the number of form fields.',
          error: 'FIELD_KEY_LIMIT'
        });
      case 'LIMIT_FIELD_VALUE':
        return res.status(400).json({
          success: false,
          message: 'Field value too large.',
          error: 'FIELD_VALUE_LIMIT'
        });
      case 'LIMIT_FIELD_COUNT':
        return res.status(400).json({
          success: false,
          message: 'Too many fields in form.',
          error: 'FIELD_COUNT_LIMIT'
        });
      case 'LIMIT_PART_COUNT':
        return res.status(400).json({
          success: false,
          message: 'Too many parts in form.',
          error: 'PART_COUNT_LIMIT'
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
    
    // Validate minimum image requirement
    if (!req.files || req.files.length < 3) {
      return res.status(400).json({
        success: false,
        message: 'Minimum 3 images are required for new arrivals. Please upload at least 3 images.',
        error: 'INSUFFICIENT_IMAGES',
        required: 3,
        provided: req.files ? req.files.length : 0
      });
    }
    
    // Validate file types
    const invalidFiles = req.files.filter(file => !file.mimetype.startsWith('image/'));
    if (invalidFiles.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Only image files are allowed. Please check your uploaded files.',
        error: 'INVALID_FILE_TYPE',
        invalidFiles: invalidFiles.map(f => f.originalname)
      });
    }
    
    next();
  });
};

// ========================================
// PUBLIC ROUTES (No Authentication Required)
// ========================================

// Get all new arrivals (public)
router.get('/public', getPublicNewArrivals);

// Get active new arrivals for homepage
router.get('/public/active', getActiveNewArrivals);

// Get featured new arrivals
router.get('/public/featured', getFeaturedNewArrivals);

// Get new arrivals by category
router.get('/public/category/:category', getNewArrivalsByCategory);

// Get single new arrival by ID (public - no auth required)
router.get('/public/:id', getSingleNewArrival);

// Analytics tracking (public)
router.post('/:id/impression', incrementImpression);
router.post('/:id/click', incrementClick);

// ========================================
// ADMIN ROUTES (Authentication Required)
// ========================================

// Create new arrival (Admin only) - with image upload support
router.post('/', isAuthenticated, isAdmin, handleFileUpload, createNewArrival);

// Get all new arrivals (Admin view with pagination)
router.get('/', isAuthenticated, isAdmin, getAllNewArrivals);

// Get statistics (Admin only)
router.get('/stats', isAuthenticated, isAdmin, getNewArrivalsStats);

// Get single new arrival (Admin)
router.get('/admin/:id', isAuthenticated, isAdmin, getSingleNewArrival);

// Update new arrival (Admin only)
router.put('/:id', isAuthenticated, isAdmin, updateNewArrival);

// Delete new arrival (Admin only)
router.delete('/:id', isAuthenticated, isAdmin, deleteNewArrival);

// Bulk operations (Admin only)
router.put('/bulk/update', isAuthenticated, isAdmin, bulkUpdateNewArrivals);

export default router; 