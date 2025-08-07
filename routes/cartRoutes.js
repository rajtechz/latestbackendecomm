import express from 'express';
import {
  addToCart,
  removeFromCart,
  updateCartItemQuantity,
  getCart,
  clearCart,
  getCartSummary,
  listAllCarts
} from '../controllers/cartController.js';

const router = express.Router();
// ========================================
// CART ROUTES (No Authentication Required)
// ========================================
// Add item to cart
router.post('/add', addToCart);

// Remove item from cart
router.delete('/remove/:itemId', removeFromCart);

// Update item quantity
router.put('/update/:itemId', updateCartItemQuantity);

// Get cart
router.get('/', getCart);

// Get cart summary (for header cart icon)
router.get('/summary', getCartSummary);

// List all carts (for debugging)
router.get('/debug/all', listAllCarts);

// Clear cart
router.delete('/clear', clearCart);

export default router; 