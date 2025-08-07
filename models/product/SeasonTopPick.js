import mongoose from 'mongoose';

const seasonTopPickSchema = new mongoose.Schema({
  // Reference to the main product (optional - can create standalone top picks)
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product'
  },
  
  // Product-specific fields for season top pick display
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
  
  // Season top pick specific fields
  season: {
    type: String,
    required: [true, 'Season is required'],
    enum: ['Spring', 'Summer', 'Fall', 'Winter', 'All Season'],
    default: 'All Season'
  },
  
  category: {
    type: String,
    required: [true, 'Category is required'],
    trim: true
  },
  
  subcategory: {
    type: String,
    trim: true
  },
  
  // Display and positioning
  priority: {
    type: Number,
    min: [1, 'Priority must be at least 1'],
    max: [10, 'Priority cannot exceed 10'],
    default: 5
  },
  
  displayOrder: {
    type: Number,
    default: 0
  },
  
  isActive: {
    type: Boolean,
    default: true
  },
  
  isFeatured: {
    type: Boolean,
    default: false
  },
  
  // Labels and badges
  labels: [{
    type: String,
    enum: ['EXCLUSIVE', 'NEW', 'BESTSELLER', 'LIMITED', 'TRENDING', 'SALE']
  }],
  
  // Images
  images: [{
    url: {
      type: String,
      required: true
    },
    alt: {
      type: String,
      default: ''
    },
    type: {
      type: String,
      enum: ['gallery', 'thumbnail', 'featured'],
      default: 'gallery'
    },
    order: {
      type: Number,
      default: 0
    }
  }],
  
  featuredImage: {
    url: {
      type: String
    },
    alt: {
      type: String,
      default: 'Featured season top pick image'
    }
  },
  
  // Analytics and tracking
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
  },
  
  // Metadata
  tags: [{
    type: String,
    trim: true
  }],
  
  keywords: [{
    type: String,
    trim: true
  }],
  
  // Timestamps
  createdAt: {
    type: Date,
    default: Date.now
  },
  
  updatedAt: {
    type: Date,
    default: Date.now
  },
  
  // Admin tracking
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

// Indexes for better query performance
seasonTopPickSchema.index({ isActive: 1, season: 1, priority: -1 });
seasonTopPickSchema.index({ category: 1, isActive: 1 });
seasonTopPickSchema.index({ isFeatured: 1, isActive: 1 });
seasonTopPickSchema.index({ createdAt: -1 });

// Pre-save middleware to update timestamps
seasonTopPickSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  
  // Calculate discount percentage if original price is provided
  if (this.originalPrice && this.currentPrice) {
    this.discountPercentage = Math.round(((this.originalPrice - this.currentPrice) / this.originalPrice) * 100);
  }
  
  // Set best price to current price if not specified
  if (!this.bestPrice) {
    this.bestPrice = this.currentPrice;
  }
  
  next();
});

// Virtual for discount amount
seasonTopPickSchema.virtual('discountAmount').get(function() {
  if (this.originalPrice && this.currentPrice) {
    return this.originalPrice - this.currentPrice;
  }
  return 0;
});

// Virtual for availability status
seasonTopPickSchema.virtual('isAvailable').get(function() {
  if (!this.isActive) return false;
  
  // Check if any size has stock
  if (this.availableSizes && this.availableSizes.length > 0) {
    return this.availableSizes.some(size => size.stock > 0 && size.isAvailable);
  }
  
  return true;
});

// Method to get total stock
seasonTopPickSchema.methods.getTotalStock = function() {
  if (!this.availableSizes || this.availableSizes.length === 0) {
    return 0;
  }
  
  return this.availableSizes.reduce((total, size) => {
    return total + (size.isAvailable ? size.stock : 0);
  }, 0);
};

// Method to check if specific size is available
seasonTopPickSchema.methods.isSizeAvailable = function(size) {
  if (!this.availableSizes || this.availableSizes.length === 0) {
    return false;
  }
  
  const sizeData = this.availableSizes.find(s => s.size === size);
  return sizeData ? (sizeData.stock > 0 && sizeData.isAvailable) : false;
};

// Method to get available sizes
seasonTopPickSchema.methods.getAvailableSizes = function() {
  if (!this.availableSizes || this.availableSizes.length === 0) {
    return [];
  }
  
  return this.availableSizes
    .filter(size => size.stock > 0 && size.isAvailable)
    .map(size => size.size);
};

// Method to increment analytics
seasonTopPickSchema.methods.incrementImpression = function() {
  this.impressions += 1;
  return this.save();
};

seasonTopPickSchema.methods.incrementClick = function() {
  this.clicks += 1;
  return this.save();
};

seasonTopPickSchema.methods.incrementConversion = function() {
  this.conversions += 1;
  return this.save();
};

// Static method to get active season top picks
seasonTopPickSchema.statics.getActiveSeasonTopPicks = function(season = null, limit = 10) {
  const query = { isActive: true };
  
  if (season && season !== 'All Season') {
    query.season = season;
  }
  
  return this.find(query)
    .sort({ priority: -1, displayOrder: 1, createdAt: -1 })
    .limit(limit);
};

// Static method to get featured season top picks
seasonTopPickSchema.statics.getFeaturedSeasonTopPicks = function(limit = 6) {
  return this.find({ 
    isActive: true, 
    isFeatured: true 
  })
    .sort({ priority: -1, displayOrder: 1, createdAt: -1 })
    .limit(limit);
};

const SeasonTopPick = mongoose.model('SeasonTopPick', seasonTopPickSchema);

export default SeasonTopPick; 