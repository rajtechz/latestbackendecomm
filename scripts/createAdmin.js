import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import Admin from '../models/admin/Admin.js';

dotenv.config();

const createAdmin = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/cartuno');
    console.log('Connected to MongoDB');

    // Check if admin already exists
    const existingAdmin = await Admin.findOne({ phoneNumber: '9455055675' });
    if (existingAdmin) {
      console.log('Admin user already exists');
      process.exit(0);
    }
    // Create admin user
    const adminData = {
      name: 'Admin',
      phoneNumber: '9455055675',
      password: 'Admin@123',
      role: 'admin',
      isActive: true,
      permissions: {
        users: true,
        products: true,
        orders: true,
        categories: true,
        settings: true
      }
    };

    const admin = await Admin.create(adminData);
    console.log('Admin user created successfully in admin collection:', admin._id);
    console.log('Collection name: admin');
    process.exit(0);

  } catch (error) {
    console.error('Error creating admin:', error);
    process.exit(1);
  }
};

createAdmin();