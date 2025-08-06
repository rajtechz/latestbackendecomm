import mongoose from 'mongoose';

const bannerSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Banner title is required'],
    trim: true,
    maxlength: [100, 'Title cannot exceed 100 characters']
  },
  subtitle: {
    type: String,
    trim: true,
    maxlength: [200, 'Subtitle cannot exceed 200 characters']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  // Desktop images
  desktopImages: [{
    url: {
      type: String,
      required: [true, 'Desktop banner image URL is required']
    },
    alt: {
      type: String,
      default: ''
    }
  }],
  // Mobile images
  mobileImages: [{
    url: {
      type: String,
      required: [true, 'Mobile banner image URL is required']
    },
    alt: {
      type: String,
      default: ''
    }
  }],
  link: {
    type: String,
    trim: true
  },
  linkText: {
    type: String,
    trim: true,
    maxlength: [50, 'Link text cannot exceed 50 characters']
  },
  position: {
    type: String,
    enum: ['hero', 'featured', 'sidebar', 'footer'],
    default: 'hero'
  },
  sortOrder: {
    type: Number,
    default: 0
  },
  isActive: {
    type: Boolean,
    default: true
  },
  isPublished: {
    type: Boolean,
    default: false
  },
  startDate: {
    type: Date,
    default: Date.now
  },
  endDate: {
    type: Date
  },
  backgroundColor: {
    type: String,
    trim: true,
    default: '#ffffff'
  },
  textColor: {
    type: String,
    trim: true,
    default: '#000000'
  },
  buttonColor: {
    type: String,
    trim: true,
    default: '#007bff'
  },
  buttonTextColor: {
    type: String,
    trim: true,
    default: '#ffffff'
  },
  targetAudience: {
    type: String,
    enum: ['all', 'new-users', 'returning-users', 'premium-users'],
    default: 'all'
  },
  displayConditions: {
    showOnHomepage: {
      type: Boolean,
      default: true
    },
    showOnCategoryPages: {
      type: Boolean,
      default: false
    },
    showOnProductPages: {
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
  slug: {
    type: String,
    unique: true,
    trim: true
  }
}, {
  timestamps: true
});

// Create slug from title before saving
bannerSchema.pre('save', function(next) {
  if (!this.slug) {
    this.slug = this.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  }
  next();
});

// Check if banner is currently active based on dates
bannerSchema.methods.isCurrentlyActive = function() {
  const now = new Date();
  return this.isActive && 
         this.isPublished && 
         this.startDate <= now && 
         (!this.endDate || this.endDate >= now);
};

// Increment impression count
bannerSchema.methods.incrementImpression = function() {
  this.analytics.impressions += 1;
  return this.save();
};

// Increment click count
bannerSchema.methods.incrementClick = function() {
  this.analytics.clicks += 1;
  return this.save();
};

// Increment conversion count
bannerSchema.methods.incrementConversion = function() {
  this.analytics.conversions += 1;
  return this.save();
};

const Banner = mongoose.model('Banner', bannerSchema);

export default Banner; 