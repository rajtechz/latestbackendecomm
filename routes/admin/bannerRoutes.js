import express from "express";
import { 
  createBanner, 
  getAllBanners, 
  getSingleBanner, 
  updateBanner, 
  deleteBanner,
  getActiveBanners,
  getDesktopBanners,
  getMobileBanners
} from "../../controllers/bannerController.js";
import { isAdmin, isAuthenticated } from "../../middleware/authMiddleware.js";
import multer from "multer";

const router = express.Router();

// Configure multer with proper file filtering
const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  // Check if file is an image
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
    fileSize: 10 * 1024 * 1024, // 10MB
    files: 20 // Max 20 files
  }
});

// Error handling middleware
const handleMulterError = (error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        message: 'File too large. Maximum size is 10MB.'
      });
    }
    if (error.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({
        success: false,
        message: 'Too many files. Maximum is 20 images.'
      });
    }
    if (error.code === 'LIMIT_UNEXPECTED_FILE') {
      return res.status(400).json({
        success: false,
        message: 'Unexpected file field. Please check your form data.'
      });
    }
  }
  
  if (error.message === 'Only image files are allowed!') {
    return res.status(400).json({
      success: false,
      message: error.message
    });
  }
  
  console.error('Upload error:', error);
  return res.status(500).json({
    success: false,
    message: 'File upload error: ' + error.message
  });
};

// Public routes (accessible to all users)
router.get("/all", getAllBanners);
router.get("/public/active", getActiveBanners);
router.get("/public/desktop", getDesktopBanners);
router.get("/public/mobile", getMobileBanners);
router.get("/public/:id", getSingleBanner);

// Admin routes (require authentication)
router.post("/create", isAuthenticated, isAdmin, upload.any(), handleMulterError, createBanner);
router.get("/:id", isAuthenticated, isAdmin, getSingleBanner);
router.put("/:id", isAuthenticated, isAdmin, upload.any(), handleMulterError, updateBanner);
router.delete("/:id", isAuthenticated, isAdmin, deleteBanner);

export default router;
