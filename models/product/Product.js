import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Product name is required'],
    trim: true,
    maxlength: [100, 'Product name cannot exceed 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Product description is required'],
    maxlength: [1000, 'Description cannot exceed 1000 characters']
  },
  price: {
    type: Number,
    required: [true, 'Product price is required'],
    min: [0, 'Price cannot be negative']
  },
  originalPrice: {
    type: Number,
    min: [0, 'Original price cannot be negative']
  },
  category: {
    type: String,
    required: [true, 'Product category is required'],
    enum: ['clothing', 'electronics', 'beauty', 'fashion', 'shoes', 'books', 'sports', 'furniture']
  },
  subcategory: {
    type: String,
    trim: true
  },
  brand: {
    type: String,
    trim: true
  },
  images: [{
    url: {
      type: String,
      required: true
    },
    alt: {
      type: String,
      default: ''
    }
  }],
  stock: {
    type: Number,
    required: [true, 'Product stock is required'],
    min: [0, 'Stock cannot be negative'],
    default: 0
  },
  sku: {
    type: String,
    unique: true,
    trim: true
  },
  tags: [{
    type: String,
    trim: true
  }],
  specifications: {
    type: Map,
    of: String
  },
  
  // Size configurations for different product types
  size: {
    type: String,
    trim: true
  },
  // For clothing - standard sizes
  clothingSize: {
    type: String,
    enum: ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL', '2XS', '2XL', '3XL', '4XL', '5XL']
  },
  // For shoes - US, UK, EU sizes
  shoeSize: {
    us: {
      type: Number,
      min: 1,
      max: 20
    },
    uk: {
      type: Number,
      min: 1,
      max: 20
    },
    eu: {
      type: Number,
      min: 20,
      max: 50
    }
  },
  // For electronics - dimensions
  dimensions: {
    length: { type: Number, min: 0 },
    width: { type: Number, min: 0 },
    height: { type: Number, min: 0 },
    unit: { type: String, enum: ['cm', 'inch', 'mm'], default: 'cm' }
  },
  
  color: {
    type: String,
    trim: true
  },
  material: {
    type: String,
    trim: true
  },
  weight: {
    type: Number,
    min: [0, 'Weight cannot be negative']
  },
  weightUnit: {
    type: String,
    enum: ['kg', 'g', 'lb', 'oz'],
    default: 'kg'
  },
  
  // Warranty and support
  warranty: {
    type: String,
    trim: true
  },
  warrantyPeriod: {
    type: Number, // in months
    min: 0
  },
  
  // Electronics specific
  powerConsumption: {
    type: String,
    trim: true
  },
  voltage: {
    type: String,
    trim: true
  },
  batteryLife: {
    type: String,
    trim: true
  },
  
  // Books specific
  author: {
    type: String,
    trim: true
  },
  isbn: {
    type: String,
    trim: true
  },
  pages: {
    type: Number,
    min: [1, 'Pages must be at least 1']
  },
  language: {
    type: String,
    trim: true
  },
  publisher: {
    type: String,
    trim: true
  },
  publicationDate: {
    type: Date
  },
  
  // Sports specific
  sportType: {
    type: String,
    trim: true
  },
  ageGroup: {
    type: String,
    enum: ['kids', 'youth', 'adult', 'senior']
  },
  
  // Furniture specific
  roomType: {
    type: String,
    enum: ['living-room', 'bedroom', 'kitchen', 'bathroom', 'office', 'dining-room', 'outdoor', 'garden']
  },
  assemblyRequired: {
    type: Boolean,
    default: false
  },
  assemblyTime: {
    type: String,
    trim: true
  },
  
  // Beauty specific
  skinType: {
    type: String,
    enum: ['all', 'oily', 'dry', 'combination', 'sensitive', 'normal']
  },
  skinConcern: {
    type: String,
    enum: ['acne', 'aging', 'brightening', 'hydration', 'anti-aging', 'sunscreen']
  },
  
  // Ratings and reviews
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
  
  // Product status
  isActive: {
    type: Boolean,
    default: true
  },
  isFeatured: {
    type: Boolean,
    default: false
  },
  isOnSale: {
    type: Boolean,
    default: false
  },
  salePercentage: {
    type: Number,
    min: 0,
    max: 100
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
  slug: {
    type: String,
    unique: true,
    trim: true
  },
  
  // Inventory tracking
  lowStockThreshold: {
    type: Number,
    default: 10
  },
  isLowStock: {
    type: Boolean,
    default: false
  },
  
  // Shipping and handling
  weightForShipping: {
    type: Number,
    min: 0
  },
  requiresSpecialHandling: {
    type: Boolean,
    default: false
  },
  
  // Product variants
  variants: [{
    name: String,
    value: String,
    price: Number,
    stock: Number
  }]
}, {
  timestamps: true
});

// Create slug from name before saving
productSchema.pre('save', function(next) {
  if (!this.slug) {
    this.slug = this.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  }
  next();
});

// Generate SKU if not provided
productSchema.pre('save', function(next) {
  if (!this.sku) {
    const timestamp = Date.now().toString().slice(-6);
    const random = Math.random().toString(36).substring(2, 5).toUpperCase();
    this.sku = `${this.category.substring(0, 3).toUpperCase()}-${timestamp}-${random}`;
  }
  next();
});

// Check if stock is low
productSchema.pre('save', function(next) {
  if (this.stock <= this.lowStockThreshold) {
    this.isLowStock = true;
  } else {
    this.isLowStock = false;
  }
  next();
});

// Calculate sale price if on sale
productSchema.pre('save', function(next) {
  if (this.isOnSale && this.salePercentage > 0 && this.originalPrice) {
    this.price = this.originalPrice * (1 - this.salePercentage / 100);
  }
  next();
});

const Product = mongoose.model('Product', productSchema);

export default Product; 