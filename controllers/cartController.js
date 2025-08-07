import Cart from '../models/Cart.js';
import Product from '../models/product/Product.js';
import NewArrival from '../models/product/NewArrival.js';
import { v4 as uuidv4 } from 'uuid';

// Helper function to generate or get session ID
const getSessionId = (req) => {
  let sessionId = req.headers['x-session-id'] || req.cookies?.sessionId;
  
  if (!sessionId) {
    sessionId = uuidv4();
    // In a real app, you'd set this as a cookie
    // res.cookie('sessionId', sessionId, { httpOnly: true, maxAge: 30 * 24 * 60 * 60 * 1000 });
  }
  
  return sessionId;
};

// Helper function to get or create cart
const getOrCreateCart = async (sessionId) => {
  try {
    let cart = await Cart.findOne({ sessionId, isActive: true });
    
    if (!cart) {
      cart = new Cart({ sessionId });
      await cart.save();
      console.log('New cart created with sessionId:', sessionId);
    } else {
      console.log('Existing cart found with sessionId:', sessionId);
    }
    
    return cart;
  } catch (error) {
    console.error('Error in getOrCreateCart:', error);
    throw error;
  }
};

// Add item to cart
export const addToCart = async (req, res) => {
  try {
    const { itemId, itemType, quantity = 1, size, color } = req.body;
    const sessionId = getSessionId(req);
    
    if (!itemId || !itemType) {
      return res.status(400).json({
        success: false,
        message: 'itemId and itemType are required'
      });
    }
    
    if (quantity < 1) {
      return res.status(400).json({
        success: false,
        message: 'Quantity must be at least 1'
      });
    }
    
    let itemData = {};
    
    // Handle different item types
    switch (itemType) {
      case 'product':
        const product = await Product.findById(itemId);
        if (!product) {
          return res.status(404).json({
            success: false,
            message: 'Product not found'
          });
        }
        
        if (!product.isActive) {
          return res.status(400).json({
            success: false,
            message: 'Product is not available'
          });
        }
        
        // Check stock
        if (product.stock < quantity) {
          return res.status(400).json({
            success: false,
            message: `Only ${product.stock} items available in stock`
          });
        }
        
        itemData = {
          itemId: product._id,
          itemType: 'product',
          title: product.name,
          price: product.price,
          originalPrice: product.originalPrice || product.price,
          quantity: parseInt(quantity),
          size: size || product.size,
          color: color || product.color,
          image: {
            url: product.images && product.images.length > 0 ? product.images[0].url : '',
            alt: product.images && product.images.length > 0 ? product.images[0].alt : product.name
          },
          brand: product.brand,
          description: product.description,
          category: product.category
        };
        break;
        
      case 'newArrival':
        const newArrival = await NewArrival.findById(itemId);
        if (!newArrival) {
          return res.status(404).json({
            success: false,
            message: 'New arrival not found'
          });
        }
        
        if (!newArrival.isActive) {
          return res.status(400).json({
            success: false,
            message: 'New arrival is not available'
          });
        }
        
        // Check if new arrival has available stock
        const availableSizes = newArrival.availableSizes || [];
        const selectedSize = size || 'M';
        const sizeData = availableSizes.find(s => s.size === selectedSize);
        
        if (sizeData && sizeData.stock < quantity) {
          return res.status(400).json({
            success: false,
            message: `Only ${sizeData.stock} items available in ${selectedSize} size`
          });
        }
        
        itemData = {
          itemId: newArrival._id,
          itemType: 'newArrival',
          title: newArrival.title,
          price: newArrival.currentPrice,
          originalPrice: newArrival.originalPrice || newArrival.currentPrice,
          quantity: parseInt(quantity),
          size: size || 'M',
          color: color || newArrival.color,
          image: {
            url: newArrival.featuredImage?.url || (newArrival.images && newArrival.images.length > 0 ? newArrival.images[0].url : ''),
            alt: newArrival.featuredImage?.alt || newArrival.title
          },
          brand: newArrival.brand,
          description: newArrival.description,
          category: newArrival.category
        };
        break;
        
      default:
        return res.status(400).json({
          success: false,
          message: 'Invalid itemType. Supported types: product, newArrival'
        });
    }
    
    // Get or create cart
    const cart = await getOrCreateCart(sessionId);
    console.log('Cart retrieved/created:', cart._id);
    
    // Add item to cart
    await cart.addItem(itemData);
    console.log('Item added to cart successfully');
    
    res.status(200).json({
      success: true,
      message: 'Item added to cart successfully',
      data: {
        cart: cart,
        summary: cart.getSummary(),
        sessionId: sessionId
      }
    });
    
  } catch (error) {
    console.error('Add to cart error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Remove item from cart
export const removeFromCart = async (req, res) => {
  try {
    const { itemId } = req.params;
    const sessionId = getSessionId(req);
    
    const cart = await Cart.findOne({ sessionId, isActive: true });
    
    if (!cart) {
      return res.status(404).json({
        success: false,
        message: 'Cart not found'
      });
    }
    
    // Remove item
    await cart.removeItem(itemId);
    
    res.status(200).json({
      success: true,
      message: 'Item removed from cart successfully',
      data: {
        cart: cart,
        summary: cart.getSummary()
      }
    });
    
  } catch (error) {
    console.error('Remove from cart error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Update item quantity
export const updateCartItemQuantity = async (req, res) => {
  try {
    const { itemId } = req.params;
    const { quantity } = req.body;
    const sessionId = getSessionId(req);
    
    if (!quantity || quantity < 1) {
      return res.status(400).json({
        success: false,
        message: 'Quantity must be at least 1'
      });
    }
    
    const cart = await Cart.findOne({ sessionId, isActive: true });
    
    if (!cart) {
      return res.status(404).json({
        success: false,
        message: 'Cart not found'
      });
    }
    
    // Update quantity
    await cart.updateItemQuantity(itemId, parseInt(quantity));
    
    res.status(200).json({
      success: true,
      message: 'Item quantity updated successfully',
      data: {
        cart: cart,
        summary: cart.getSummary()
      }
    });
    
  } catch (error) {
    console.error('Update cart quantity error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Get cart
export const getCart = async (req, res) => {
  try {
    const sessionId = getSessionId(req);
    
    console.log('🔍 Looking for cart with sessionId:', sessionId);
    
    const cart = await Cart.findOne({ sessionId, isActive: true });
    
    if (!cart) {
      console.log('❌ No cart found for sessionId:', sessionId);
      
      // Check if there are any carts in the database
      const allCarts = await Cart.find({ isActive: true }).limit(5);
      console.log('📋 Available carts in database:', allCarts.length);
      allCarts.forEach((c, i) => {
        console.log(`Cart ${i + 1}: SessionId: ${c.sessionId}, Items: ${c.items.length}`);
      });
      
      // Return empty cart
      return res.status(200).json({
        success: true,
        message: 'No cart found for this session. Please add items to create a cart.',
        data: {
          cart: {
            items: [],
            totalItems: 0,
            subtotal: 0,
            totalDiscount: 0,
            totalAmount: 0
          },
          summary: {
            totalItems: 0,
            subtotal: 0,
            totalDiscount: 0,
            totalAmount: 0,
            itemCount: 0
          },
          debug: {
            sessionId: sessionId,
            availableCarts: allCarts.length,
            cartSessions: allCarts.map(c => c.sessionId)
          }
        }
      });
    }
    
    console.log('✅ Cart found with', cart.items.length, 'items');
    
    res.status(200).json({
      success: true,
      data: {
        cart: cart,
        summary: cart.getSummary()
      }
    });
    
  } catch (error) {
    console.error('Get cart error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Clear cart
export const clearCart = async (req, res) => {
  try {
    const sessionId = getSessionId(req);
    
    const cart = await Cart.findOne({ sessionId, isActive: true });
    
    if (!cart) {
      return res.status(404).json({
        success: false,
        message: 'Cart not found'
      });
    }
    
    // Clear cart
    await cart.clearCart();
    
    res.status(200).json({
      success: true,
      message: 'Cart cleared successfully',
      data: {
        cart: cart,
        summary: cart.getSummary()
      }
    });
    
  } catch (error) {
    console.error('Clear cart error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Get cart summary (for header cart icon)
export const getCartSummary = async (req, res) => {
  try {
    const sessionId = getSessionId(req);
    
    const cart = await Cart.findOne({ sessionId, isActive: true });
    
    if (!cart) {
      return res.status(200).json({
        success: true,
        data: {
          totalItems: 0,
          itemCount: 0,
          totalAmount: 0
        }
      });
    }
    
    const summary = cart.getSummary();
    
    res.status(200).json({
      success: true,
      data: summary
    });
    
  } catch (error) {
    console.error('Get cart summary error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// List all carts (for debugging)
export const listAllCarts = async (req, res) => {
  try {
    const allCarts = await Cart.find({ isActive: true }).sort({ createdAt: -1 }).limit(10);
    
    const cartsWithItems = allCarts.map(cart => ({
      sessionId: cart.sessionId,
      itemCount: cart.items.length,
      totalItems: cart.totalItems,
      totalAmount: cart.totalAmount,
      createdAt: cart.createdAt,
      items: cart.items.map(item => ({
        title: item.title,
        itemId: item.itemId,
        quantity: item.quantity,
        size: item.size,
        color: item.color
      }))
    }));
    
    res.status(200).json({
      success: true,
      message: `Found ${allCarts.length} active carts`,
      data: {
        totalCarts: allCarts.length,
        carts: cartsWithItems
      }
    });
    
  } catch (error) {
    console.error('List all carts error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
}; 