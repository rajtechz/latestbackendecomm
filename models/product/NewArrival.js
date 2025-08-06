import mongoose from 'mongoose';

const newArrivalSchema = new mongoose.Schema({
  // Reference to the main product (optional - can create standalone new arrivals)
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product'
  },
  
  // Product-specific fields for new arrival display
  title: {
    type: String,
    required: [true, 'Product title is required'],
    trim: true,
    maxlength: [200, 'Product title cannot exceed 200 characters']
  },
  
  description: {
    type: String,
    trim: true,
    maxlength: [1000, 'Description cannot exceed 1000 characters']
  },
  
  // Pricing information
  currentPrice: {
    type: Number,
    required: [true, 'Current price is required'],
    min: [0, 'Price cannot be negative']
  },
  
  originalPrice: {
    type: Number,
    min: [0, 'Original price cannot be negative']
  },
  
  discountPercentage: {
    type: Number,
    min: [0, 'Discount percentage cannot be negative'],
    max: [100, 'Discount percentage cannot exceed 100']
  },
  
  bestPrice: {
    type: Number,
    min: [0, 'Best price cannot be negative']
  },
  
  // Product details
  brand: {
    type: String,
    trim: true
  },
  
  color: {
    type: String,
    trim: true
  },
  
  material: {
    type: String,
    trim: true
  },
  
  // Size configurations
  availableSizes: [{
    size: {
      type: String,
      required: true,
      enum: ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL', '2XS', '2XL', '3XL', '4XL', '5XL']
    },
    stock: {
      type: Number,
      default: 0,
      min: [0, 'Stock cannot be negative']
    },
    isAvailable: {
      type: Boolean,
      default: true
    }
  }],
  
  // Rating and reviews
  rating: {
    type: Number,
    min: [0, 'Rating cannot be negative'],
    max: [5, 'Rating cannot exceed 5'],
    default: 0
  },
  
  numReviews: {
    type: Number,
    min: [0, 'Number of reviews cannot be negative'],
    default: 0
  },
  
  // New arrival specific fields
  arrivalDate: {
    type: Date,
    default: Date.now,
    required: [true, 'Arrival date is required']
  },
  
  // Display settings
  isActive: {
    type: Boolean,
    default: true
  },
  
  isFeatured: {
    type: Boolean,
    default: false
  },
  
  // Display order for carousel/slider
  displayOrder: {
    type: Number,
    default: 0
  },
  
  // Display duration (in days)
  displayDuration: {
    type: Number,
    default: 30, // Show for 30 days by default
    min: [1, 'Display duration must be at least 1 day']
  },
  
  // Display conditions
  displayConditions: {
    showOnHomepage: {
      type: Boolean,
      default: true
    },
    showOnCategoryPages: {
      type: Boolean,
      default: false
    },
    showOnMobile: {
      type: Boolean,
      default: true
    },
    showOnDesktop: {
      type: Boolean,
      default: true
    }
  },
  
  // Analytics tracking
  analytics: {
    impressions: {
      type: Number,
      default: 0
    },
    clicks: {
      type: Number,
      default: 0
    },
    conversions: {
      type: Number,
      default: 0
    }
  },
  
  // SEO and meta
  metaTitle: {
    type: String,
    trim: true,
    maxlength: [60, 'Meta title cannot exceed 60 characters']
  },
  metaDescription: {
    type: String,
    trim: true,
    maxlength: [160, 'Meta description cannot exceed 160 characters']
  },
  
  // Tags for categorization
  tags: [{
    type: String,
    trim: true
  }],
  
  // Priority level (1-10, 10 being highest priority)
  priority: {
    type: Number,
    min: 1,
    max: 10,
    default: 5
  },
  
  // Expiry date (optional)
  expiryDate: {
    type: Date
  },
  
  // Notes for admin
  adminNotes: {
    type: String,
    trim: true,
    maxlength: [500, 'Admin notes cannot exceed 500 characters']
  },
  
  // New arrival specific images
  images: [{
    url: {
      type: String,
      required: [true, 'Image URL is required']
    },
    alt: {
      type: String,
      trim: true,
      maxlength: [100, 'Alt text cannot exceed 100 characters']
    },
    type: {
      type: String,
      enum: ['desktop', 'mobile', 'banner', 'gallery'],
      default: 'gallery'
    },
    order: {
      type: Number,
      default: 0
    }
  }],
  
  // Featured image for new arrival
  featuredImage: {
    url: {
      type: String,
      trim: true
    },
    alt: {
      type: String,
      trim: true,
      maxlength: [100, 'Alt text cannot exceed 100 characters']
    }
  },
  
  // Track who created this new arrival
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

// Create index for efficient queries
newArrivalSchema.index({ arrivalDate: -1 });
newArrivalSchema.index({ isActive: 1, displayOrder: 1 });
newArrivalSchema.index({ expiryDate: 1 });
newArrivalSchema.index({ currentPrice: 1 });
newArrivalSchema.index({ rating: -1 });

// Virtual for checking if new arrival is still valid
newArrivalSchema.virtual('isValid').get(function() {
  const now = new Date();
  const expiryDate = this.expiryDate || new Date(this.arrivalDate.getTime() + (this.displayDuration * 24 * 60 * 60 * 1000));
  return this.isActive && now <= expiryDate;
});

// Virtual for calculating discount percentage
newArrivalSchema.virtual('calculatedDiscountPercentage').get(function() {
  if (this.originalPrice && this.currentPrice) {
    return Math.round(((this.originalPrice - this.currentPrice) / this.originalPrice) * 100);
  }
  return this.discountPercentage || 0;
});

// Virtual for checking if product is on sale
newArrivalSchema.virtual('isOnSale').get(function() {
  return this.originalPrice && this.currentPrice && this.currentPrice < this.originalPrice;
});

// Method to check if new arrival should be displayed
newArrivalSchema.methods.shouldDisplay = function(deviceType = 'desktop') {
  if (!this.isActive) return false;
  
  const now = new Date();
  const expiryDate = this.expiryDate || new Date(this.arrivalDate.getTime() + (this.displayDuration * 24 * 60 * 60 * 1000));
  
  if (now > expiryDate) return false;
  
  if (deviceType === 'mobile' && !this.displayConditions.showOnMobile) return false;
  if (deviceType === 'desktop' && !this.displayConditions.showOnDesktop) return false;
  
  return true;
};

// Method to increment impression
newArrivalSchema.methods.incrementImpression = function() {
  this.analytics.impressions += 1;
  return this.save();
};

// Method to increment click
newArrivalSchema.methods.incrementClick = function() {
  this.analytics.clicks += 1;
  return this.save();
};

// Method to increment conversion
newArrivalSchema.methods.incrementConversion = function() {
  this.analytics.conversions += 1;
  return this.save();
};

// Method to check size availability
newArrivalSchema.methods.isSizeAvailable = function(size) {
  const sizeObj = this.availableSizes.find(s => s.size === size);
  return sizeObj && sizeObj.isAvailable && sizeObj.stock > 0;
};

// Method to get available sizes
newArrivalSchema.methods.getAvailableSizes = function() {
  return this.availableSizes.filter(size => size.isAvailable && size.stock > 0);
};

// Pre-save middleware to set default meta fields
newArrivalSchema.pre('save', function(next) {
  if (!this.metaTitle) {
    this.metaTitle = `New Arrival - ${this.title || 'Product'}`;
  }
  if (!this.metaDescription) {
    this.metaDescription = `Check out our latest new arrival: ${this.title}. Limited time offer!`;
  }
  
  // Calculate discount percentage if not provided
  if (this.originalPrice && this.currentPrice && !this.discountPercentage) {
    this.discountPercentage = Math.round(((this.originalPrice - this.currentPrice) / this.originalPrice) * 100);
  }
  
  next();
});

const NewArrival = mongoose.model('NewArrival', newArrivalSchema);

export default NewArrival; 