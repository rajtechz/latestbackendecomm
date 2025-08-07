import mongoose from 'mongoose';

const cartItemSchema = new mongoose.Schema({
  itemId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },
  itemType: {
    type: String,
    enum: ['product', 'newArrival', 'banner', 'featured'],
    required: true
  },
  title: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  originalPrice: {
    type: Number,
    min: 0
  },
  quantity: {
    type: Number,
    required: true,
    min: 1,
    default: 1
  },
  size: {
    type: String,
    trim: true
  },
  color: {
    type: String,
    trim: true
  },
  image: {
    url: {
      type: String,
      required: true
    },
    alt: {
      type: String,
      default: ''
    }
  },
  // Additional fields for different item types
  brand: {
    type: String,
    trim: true
  },
  description: {
    type: String
  },
  category: {
    type: String,
    trim: true
  }
}, { timestamps: true });

const cartSchema = new mongoose.Schema({
  sessionId: {
    type: String,
    required: true,
    unique: true
  },
  items: [cartItemSchema],
  totalItems: {
    type: Number,
    default: 0
  },
  subtotal: {
    type: Number,
    default: 0
  },
  totalDiscount: {
    type: Number,
    default: 0
  },
  totalAmount: {
    type: Number,
    default: 0
  },
  isActive: {
    type: Boolean,
    default: true
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

// Pre-save middleware to calculate totals
cartSchema.pre('save', function(next) {
  this.totalItems = this.items.reduce((sum, item) => sum + item.quantity, 0);
  this.subtotal = this.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  this.totalDiscount = this.items.reduce((sum, item) => {
    const discount = (item.originalPrice || item.price) - item.price;
    return sum + (discount * item.quantity);
  }, 0);
  this.totalAmount = this.subtotal;
  this.lastUpdated = new Date();
  next();
});

// Method to add item to cart
cartSchema.methods.addItem = function(itemData) {
  console.log('Adding item to cart:', itemData);
  
  const existingItemIndex = this.items.findIndex(item => 
    item.itemId.toString() === itemData.itemId.toString() &&
    item.size === itemData.size &&
    item.color === itemData.color &&
    item.itemType === itemData.itemType
  );

  if (existingItemIndex > -1) {
    // Update existing item quantity
    this.items[existingItemIndex].quantity += itemData.quantity;
    console.log('Updated existing item quantity');
  } else {
    // Add new item
    this.items.push(itemData);
    console.log('Added new item to cart');
  }
  
  console.log('Cart items count:', this.items.length);
  return this.save();
};

// Method to remove item from cart
cartSchema.methods.removeItem = function(itemId) {
  this.items = this.items.filter(item => item._id.toString() !== itemId.toString());
  return this.save();
};

// Method to update item quantity
cartSchema.methods.updateItemQuantity = function(itemId, quantity) {
  const item = this.items.find(item => item._id.toString() === itemId.toString());
  if (item) {
    item.quantity = Math.max(1, quantity);
    return this.save();
  }
  throw new Error('Item not found in cart');
};

// Method to clear cart
cartSchema.methods.clearCart = function() {
  this.items = [];
  return this.save();
};

// Method to get cart summary
cartSchema.methods.getSummary = function() {
  return {
    totalItems: this.totalItems,
    subtotal: this.subtotal,
    totalDiscount: this.totalDiscount,
    totalAmount: this.totalAmount,
    itemCount: this.items.length
  };
};

const Cart = mongoose.model('Cart', cartSchema);

export default Cart; 