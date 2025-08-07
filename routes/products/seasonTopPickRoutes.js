import express from 'express';
import multer from 'multer';
import {
  createSeasonTopPick,
  getAllSeasonTopPicks,
  getSingleSeasonTopPick,
  updateSeasonTopPick,
  deleteSeasonTopPick,
  getActiveSeasonTopPicks,
  getFeaturedSeasonTopPicks,
  getSeasonTopPicksByCategory,
  incrementImpression,
  incrementClick,
  bulkUpdateSeasonTopPicks,
  getSeasonTopPicksStats,
  getPublicSeasonTopPicks,
  getUserSeasonTopPicks,
  getUserActiveSeasonTopPicks,
  getUserFeaturedSeasonTopPicks,
  getUserSeasonTopPicksByCategory,
  getUserSingleSeasonTopPick
} from '../../controllers/productController/seasonTopPickController.js';
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
    
    // Validate minimum image requirement (1 image for season top picks)
    if (!req.files || req.files.length < 1) {
      return res.status(400).json({
        success: false,
        message: 'Minimum 1 image is required for season top picks. Please upload at least 1 image.',
        error: 'INSUFFICIENT_IMAGES',
        required: 1,
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
// ADMIN ROUTES (Authentication Required)
// ========================================

// Create season top pick (Admin only)
router.post('/create', 
  isAuthenticated, 
  isAdmin, 
  handleFileUpload, 
  createSeasonTopPick
);

// Get all season top picks (Admin)
router.get('/admin/all', isAuthenticated, isAdmin, getAllSeasonTopPicks);

// Get single season top pick by ID (Admin)
router.get('/admin/:id', isAuthenticated, isAdmin, getSingleSeasonTopPick);

// Update season top pick (Admin)
router.put('/admin/:id', 
  isAuthenticated, 
  isAdmin, 
  handleFileUpload, 
  updateSeasonTopPick
);

// Delete season top pick (Admin)
router.delete('/admin/:id', isAuthenticated, isAdmin, deleteSeasonTopPick);

// Bulk update season top picks (Admin)
router.put('/admin/bulk-update', isAuthenticated, isAdmin, bulkUpdateSeasonTopPicks);

// Get season top picks statistics (Admin)
router.get('/admin/stats', isAuthenticated, isAdmin, getSeasonTopPicksStats);

// ========================================
// PUBLIC ROUTES (No Authentication Required)
// ========================================

// Get all public season top picks
router.get('/public/all', getPublicSeasonTopPicks);

// Get active season top picks
router.get('/public/active', getActiveSeasonTopPicks);

// Get featured season top picks
router.get('/public/featured', getFeaturedSeasonTopPicks);

// Get season top picks by category
router.get('/public/category/:category', getSeasonTopPicksByCategory);

// Get single season top pick by ID (public)
router.get('/public/:id', getSingleSeasonTopPick);

// Analytics tracking (public)
router.post('/:id/impression', incrementImpression);
router.post('/:id/click', incrementClick);

// ========================================
// USER ROUTES (Authentication Required - Read Only)
// ========================================

// Get all season top picks (User can read)
router.get('/user/all', isAuthenticated, getUserSeasonTopPicks);

// Get active season top picks (User can read)
router.get('/user/active', isAuthenticated, getUserActiveSeasonTopPicks);

// Get featured season top picks (User can read)
router.get('/user/featured', isAuthenticated, getUserFeaturedSeasonTopPicks);

// Get season top picks by category (User can read)
router.get('/user/category/:category', isAuthenticated, getUserSeasonTopPicksByCategory);

// Get single season top pick by ID (User can read)
router.get('/user/:id', isAuthenticated, getUserSingleSeasonTopPick);

export default router; 