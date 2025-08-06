import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const adminSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    minlength: [2, 'Name must be at least 2 characters long'],
    maxlength: [50, 'Name cannot exceed 50 characters']
  },
  email: {
    type: String,
    required: false,
    unique: true,
    sparse: true,
    lowercase: true,
    trim: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  phoneNumber: {
    type: String,
    required: [true, 'Mobile number is required'],
    unique: true,
    trim: true,
    match: [/^[\+]?[1-9][\d]{0,15}$/, 'Please enter a valid mobile number']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters long'],
    select: false
  },
  role: {
    type: String,
    enum: ['admin', 'super_admin'],
    default: 'admin'
  },
  avatar: {
    public_id: {
      type: String,
      default: ''
    },
    url: {
      type: String,
      default: 'https://res.cloudinary.com/demo/image/upload/v1312461204/sample.jpg'
    }
  },
  permissions: {
    users: { type: Boolean, default: true },
    products: { type: Boolean, default: true },
    orders: { type: Boolean, default: true },
    categories: { type: Boolean, default: true },
    settings: { type: Boolean, default: true }
  },
  isActive: {
    type: Boolean,
    default: true
  },
  lastLogin: {
    type: Date,
    default: Date.now
  },
  loginAttempts: {
    type: Number,
    default: 0
  },
  lockUntil: {
    type: Date
  }
}, {
  timestamps: true,
  collection: 'admin' // This ensures the collection name is 'admin' instead of 'admins'
});

// Index for better query performance
adminSchema.index({ email: 1 }, { sparse: true, unique: true });
adminSchema.index({ phoneNumber: 1 }, { unique: true });
adminSchema.index({ role: 1 });

// Pre-save middleware to hash password
adminSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    this.password = await bcrypt.hash(this.password, 12);
    next();
  } catch (error) {
    next(error);
  }
});

// Instance method to check password
adminSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Instance method to get public profile
adminSchema.methods.getPublicProfile = function() {
  const adminObject = this.toObject();
  delete adminObject.password;
  return adminObject;
};

// Static method to find admin by mobile number
adminSchema.statics.findByMobile = function(mobile) {
  return this.findOne({ phoneNumber: mobile });
};

// Virtual for mobile (alias for phoneNumber)
adminSchema.virtual('mobile').get(function() {
  return this.phoneNumber;
});

// Ensure virtual fields are serialized
adminSchema.set('toJSON', { virtuals: true });
adminSchema.set('toObject', { virtuals: true });

const Admin = mongoose.model('Admin', adminSchema);

export default Admin; 