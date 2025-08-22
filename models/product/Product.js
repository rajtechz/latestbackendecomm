import mongoose from 'mongoose';
const productSchema = new mongoose.Schema({
  // Basic product information
  title: {
    type: String,
    required: [true, 'Product title is required'],
    trim: true,
    maxlength: [200, 'Product title cannot exceed 200 characters']
  },
  
  slug: {
    type: String,
    required: [true, 'Product slug is required'],
    unique: true,
    trim: true,
    lowercase: true,
    match: [/^[a-z0-9-]+$/, 'Slug can only contain lowercase letters, numbers, and hyphens']
  },
  
  description: {
    type: String,
    trim: true,
    maxlength: [2000, 'Description cannot exceed 2000 characters']
  },
  
  shortDescription: {
    type: String,
    trim: true,
    maxlength: [500, 'Short description cannot exceed 500 characters']
  },
  
  // Pricing
  currentPrice: {
    type: Number,
    required: [true, 'Current price is required'],
    min: [0, 'Price cannot be negative']
  },
  
  originalPrice: {
    type: Number,
    min: [0, 'Original price cannot be negative']
  },
  
  bestPrice: {
    type: Number,
    min: [0, 'Best price cannot be negative']
  },
  
  discountPercentage: {
    type: Number,
    min: [0, 'Discount percentage cannot be negative'],
    max: [100, 'Discount percentage cannot exceed 100']
  },
  
  // Category and classification
  category: {
    type: String,
    required: [true, 'Product category is required'],
    enum: ['men', 'women', 'kids', 'furniture', 'electronics', 'beauty', 'fashion', 'sport', 'other'],
    default: 'other'
  },
  
  subCategory: {
    type: String,
    trim: true,
    maxlength: [100, 'Sub-category cannot exceed 100 characters']
  },
  
  // Brand and product details
  brand: {
    type: String,
    trim: true,
    maxlength: [100, 'Brand name cannot exceed 100 characters']
  },
  
  model: {
    type: String,
    trim: true,
    maxlength: [100, 'Model name cannot exceed 100 characters']
  },
  
  sku: {
    type: String,
    trim: true,
    unique: true,
    maxlength: [50, 'SKU cannot exceed 50 characters']
  },
  
  // Visual representation - Multiple images for auto-sliding
  images: [{
    url: {
      type: String,
      required: true
    },
    alt: {
      type: String,
      default: 'Product image'
    },
    order: {
      type: Number,
      default: 0
    },
    isPrimary: {
      type: Boolean,
      default: false
    }
  }],
  
  // Thumbnail image for cart and quick display
  thumbnailImage: {
    url: {
      type: String,
      default: ''
    },
    alt: {
      type: String,
      default: 'Product thumbnail'
    }
  },
  
  // Labels and badges (like "NEW DROP")
  labels: [{
    type: String,
    enum: ['NEW DROP', 'EXCLUSIVE', 'BESTSELLER', 'LIMITED', 'SALE', 'TRENDING', 'FEATURED', 'PREMIUM'],
    default: []
  }],
  
  // Display properties
  displayOrder: {
    type: Number,
    default: 0,
    min: [0, 'Display order cannot be negative']
  },
  
  isActive: {
    type: Boolean,
    default: true
  },
  
  isFeatured: {
    type: Boolean,
    default: false
  },
  
  isNew: {
    type: Boolean,
    default: false
  },
  
  // Inventory
  stockQuantity: {
    type: Number,
    default: 0,
    min: [0, 'Stock quantity cannot be negative']
  },
  
  isInStock: {
    type: Boolean,
    default: true
  },
  
  allowBackorder: {
    type: Boolean,
    default: false
  },
  
  // Sizes and colors
  availableSizes: [{
    type: String,
    enum: ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL', 'ONE_SIZE', '28', '30', '32', '34', '36', '38', '40', '42', '44', '46'],
    default: []
  }],
  
  availableColors: [{
    name: {
      type: String,
      trim: true
    },
    code: {
      type: String,
      trim: true
    },
    stockQuantity: {
      type: Number,
      default: 0
    }
  }],
  
  // Product specifications
  specifications: [{
    name: {
      type: String,
      trim: true
    },
    value: {
      type: String,
      trim: true
    }
  }],
  
  // Material and care
  material: {
    type: String,
    trim: true,
    maxlength: [200, 'Material cannot exceed 200 characters']
  },
  
  careInstructions: {
    type: String,
    trim: true,
    maxlength: [500, 'Care instructions cannot exceed 500 characters']
  },
  
  // Analytics and tracking
  clicks: {
    type: Number,
    default: 0
  },
  
  impressions: {
    type: Number,
    default: 0
  },
  
  views: {
    type: Number,
    default: 0
  },
  
  sales: {
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
  
  // SEO
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
productSchema.index({ category: 1, isActive: 1 });
productSchema.index({ category: 1, subCategory: 1, isActive: 1 });
productSchema.index({ isFeatured: 1, isActive: 1 });
productSchema.index({ isNew: 1, isActive: 1 });
productSchema.index({ labels: 1, isActive: 1 });
productSchema.index({ slug: 1 });
productSchema.index({ brand: 1, isActive: 1 });
productSchema.index({ displayOrder: 1, createdAt: -1 });

// Pre-save middleware to update timestamps and calculate discounts
productSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  
  // Calculate discount percentage if original price is provided
  if (this.originalPrice && this.currentPrice) {
    this.discountPercentage = Math.round(((this.originalPrice - this.currentPrice) / this.originalPrice) * 100);
  }
  
  // Update stock status
  this.isInStock = this.stockQuantity > 0;
  
  // Set primary image if not set
  if (this.images && this.images.length > 0) {
    const primaryImage = this.images.find(img => img.isPrimary);
    if (!primaryImage && this.images.length > 0) {
      this.images[0].isPrimary = true;
    }
  }
  
  next();
});

// Virtual for click-through rate
productSchema.virtual('clickThroughRate').get(function() {
  if (this.impressions === 0) return 0;
  return Math.round((this.clicks / this.impressions) * 100 * 100) / 100;
});

// Virtual for discount amount
productSchema.virtual('discountAmount').get(function() {
  if (!this.originalPrice || !this.currentPrice) return 0;
  return this.originalPrice - this.currentPrice;
});

// Virtual for primary image
productSchema.virtual('primaryImage').get(function() {
  if (!this.images || this.images.length === 0) return null;
  const primary = this.images.find(img => img.isPrimary);
  return primary || this.images[0];
});

// Method to increment clicks
productSchema.methods.incrementClick = async function() {
  this.clicks += 1;
  return await this.save();
};

// Method to increment impressions
productSchema.methods.incrementImpression = async function() {
  this.impressions += 1;
  return await this.save();
};

// Method to increment views
productSchema.methods.incrementView = async function() {
  this.views += 1;
  return await this.save();
};

// Method to increment sales
productSchema.methods.incrementSales = async function(quantity = 1) {
  this.sales += quantity;
  this.stockQuantity = Math.max(0, this.stockQuantity - quantity);
  this.isInStock = this.stockQuantity > 0;
  return await this.save();
};

// Static method to get products by category
productSchema.statics.getProductsByCategory = function(category, options = {}) {
  const query = { category, isActive: true };
  
  if (options.subCategory) {
    query.subCategory = options.subCategory;
  }
  
  if (options.labels && options.labels.length > 0) {
    query.labels = { $in: options.labels };
  }
  
  return this.find(query)
    .sort({ displayOrder: 1, createdAt: -1 })
    .limit(options.limit || 20)
    .skip(options.skip || 0);
};

// Static method to get featured products
productSchema.statics.getFeaturedProducts = function(category = null, limit = 10) {
  const query = { isActive: true, isFeatured: true };
  
  if (category) {
    query.category = category;
  }
  
  return this.find(query)
    .sort({ displayOrder: 1, createdAt: -1 })
    .limit(limit);
};

// Static method to get new products
productSchema.statics.getNewProducts = function(category = null, limit = 10) {
  const query = { isActive: true, isNew: true };
  
  if (category) {
    query.category = category;
  }
  
  return this.find(query)
    .sort({ createdAt: -1 })
    .limit(limit);
};

// Static method to get products with specific labels
productSchema.statics.getProductsByLabels = function(labels, category = null, limit = 10) {
  const query = { isActive: true, labels: { $in: labels } };
  
  if (category) {
    query.category = category;
  }
  
  return this.find(query)
    .sort({ displayOrder: 1, createdAt: -1 })
    .limit(limit);
};

// Static method to search products
productSchema.statics.searchProducts = function(searchTerm, category = null, limit = 20) {
  const query = {
    isActive: true,
    $or: [
      { title: { $regex: searchTerm, $options: 'i' } },
      { description: { $regex: searchTerm, $options: 'i' } },
      { brand: { $regex: searchTerm, $options: 'i' } },
      { tags: { $in: [new RegExp(searchTerm, 'i')] } }
    ]
  };
  
  if (category) {
    query.category = category;
  }
  
  return this.find(query)
    .sort({ displayOrder: 1, createdAt: -1 })
    .limit(limit);
};

const Product = mongoose.model('Product', productSchema);

export default Product; 