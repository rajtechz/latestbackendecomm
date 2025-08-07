import mongoose from 'mongoose';

const trendingCategorySchema = new mongoose.Schema({
  // Category information
  name: {
    type: String,
    required: [true, 'Category name is required'],
    trim: true,
    maxlength: [100, 'Category name cannot exceed 100 characters']
  },
  
  slug: {
    type: String,
    required: [true, 'Category slug is required'],
    unique: true,
    trim: true,
    lowercase: true,
    match: [/^[a-z0-9-]+$/, 'Slug can only contain lowercase letters, numbers, and hyphens']
  },
  
  description: {
    type: String,
    trim: true,
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  
  // Visual representation
  image: {
    url: {
      type: String,
      required: [true, 'Category image is required']
    },
    alt: {
      type: String,
      default: 'Category image'
    }
  },
  
  // Navigation and linking
  targetUrl: {
    type: String,
    required: [true, 'Target URL is required'],
    trim: true
  },
  
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
  
  // Category type and grouping
  categoryType: {
    type: String,
    required: [true, 'Category type is required'],
    enum: ['men', 'women', 'kids', 'electronics', 'furniture', 'fashion', 'footwear', 'sports', 'books', 'other'],
    default: 'other'
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
trendingCategorySchema.index({ isActive: 1, displayOrder: 1 });
trendingCategorySchema.index({ categoryType: 1, isActive: 1 });
trendingCategorySchema.index({ isFeatured: 1, isActive: 1 });
trendingCategorySchema.index({ slug: 1 });

// Pre-save middleware to update timestamps
trendingCategorySchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

// Virtual for click-through rate
trendingCategorySchema.virtual('clickThroughRate').get(function() {
  if (this.impressions === 0) return 0;
  return Math.round((this.clicks / this.impressions) * 100 * 100) / 100; // Round to 2 decimal places
});

// Method to increment clicks
trendingCategorySchema.methods.incrementClick = async function() {
  this.clicks += 1;
  return await this.save();
};

// Method to increment impressions
trendingCategorySchema.methods.incrementImpression = async function() {
  this.impressions += 1;
  return await this.save();
};

// Static method to get active categories
trendingCategorySchema.statics.getActiveCategories = function() {
  return this.find({ isActive: true }).sort({ displayOrder: 1, createdAt: -1 });
};

// Static method to get featured categories
trendingCategorySchema.statics.getFeaturedCategories = function() {
  return this.find({ isActive: true, isFeatured: true }).sort({ displayOrder: 1, createdAt: -1 });
};

const TrendingCategory = mongoose.model('TrendingCategory', trendingCategorySchema);

export default TrendingCategory; 