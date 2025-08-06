import express from 'express';
import {
  createProduct, updateProduct, deleteProduct,
  getAllProducts, getSingleProduct, deleteProductImage
} from '../../controllers/productController/productController.js';
import { isAdmin, isAuthenticated } from '../../middleware/authMiddleware.js';
import { uploadMultipleImages, handleUploadError } from '../../middleware/uploadMiddleware.js';

const router = express.Router();

// Public routes
router.get('/', getAllProducts);
router.get('/:id', getSingleProduct);

// Admin-only routes with image upload
router.post('/', isAuthenticated, isAdmin, uploadMultipleImages, handleUploadError, createProduct);
router.put('/:id', isAuthenticated, isAdmin, uploadMultipleImages, handleUploadError, updateProduct);
router.delete('/:id', isAuthenticated, isAdmin, deleteProduct);

// Delete specific image from product
router.delete('/:productId/images/:imageIndex', isAuthenticated, isAdmin, deleteProductImage);

export default router;
