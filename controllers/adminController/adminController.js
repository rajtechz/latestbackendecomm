import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import Admin from "../../models/admin/Admin.js";

// Admin Login API
export const adminLogin = async (req, res) => {
  try {
    const { mobile, password } = req.body;

    // Validation
    if (!mobile || !password) {
      return res.status(400).json({ 
        message: "Mobile number and password are required", 
        success: false 
      });
    }

    // Check if it's the specific admin credentials
    if (mobile !== "9455055675" || password !== "Admin@123") {
      return res.status(401).json({ 
        message: "Invalid admin credentials", 
        success: false 
      });
    }

    // Find admin by mobile number
    const admin = await Admin.findOne({ phoneNumber: mobile }).select('+password');

    if (!admin) {
      return res.status(401).json({ 
        message: "Admin not found", 
        success: false 
      });
    }

    // Check if admin is active
    if (!admin.isActive) {
      return res.status(401).json({ 
        message: "Admin account is deactivated", 
        success: false 
      });
    }

    // Update last login
    admin.lastLogin = new Date();
    await admin.save();

    // Generate JWT token
    const token = jwt.sign(
      { 
        id: admin._id, 
        role: admin.role,
        email: admin.email,
        mobile: admin.phoneNumber
      }, 
      process.env.JWT_SECRET, 
      { expiresIn: "7d" }
    );

    // Remove sensitive data from response
    const adminResponse = {
      _id: admin._id,
      name: admin.name,
      email: admin.email,
      mobile: admin.phoneNumber,
      role: admin.role,
      avatar: admin.avatar,
      permissions: admin.permissions,
      lastLogin: admin.lastLogin,
      isActive: admin.isActive,
      createdAt: admin.createdAt,
      updatedAt: admin.updatedAt
    };

    res.status(200).json({ 
      message: "Admin login successful", 
      admin: adminResponse,
      token,
      success: true 
    });

  } catch (error) {
    console.error('Admin login error:', error);
    res.status(500).json({ 
      message: "Internal server error", 
      success: false 
    });
  }
};

// Get admin profile
export const getAdminProfile = async (req, res) => {
  try {
    const admin = await Admin.findById(req.user.id);
    if (!admin) {
      return res.status(404).json({ 
        message: "Admin not found", 
        success: false 
      });
    }

    const adminResponse = {
      _id: admin._id,
      name: admin.name,
      email: admin.email,
      mobile: admin.phoneNumber,
      role: admin.role,
      avatar: admin.avatar,
      permissions: admin.permissions,
      lastLogin: admin.lastLogin,
      isActive: admin.isActive,
      createdAt: admin.createdAt,
      updatedAt: admin.updatedAt
    };

    res.status(200).json({ 
      message: "Admin profile retrieved successfully", 
      admin: adminResponse,
      success: true 
    });

  } catch (error) {
    console.error('Get admin profile error:', error);
    res.status(500).json({ 
      message: "Internal server error", 
      success: false 
    });
  }
};

// Admin logout
export const adminLogout = async (req, res) => {
  try {
    res.status(200).json({ 
      message: "Admin logged out successfully", 
      success: true 
    });
  } catch (error) {
    console.error('Admin logout error:', error);
    res.status(500).json({ 
      message: "Internal server error", 
      success: false 
    });
  }
}; 