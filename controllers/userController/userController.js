import jwt from "jsonwebtoken";
import User from "../../models/user/User.js";
import dotenv from "dotenv";

dotenv.config()
// Log JWT_SECRET to confirm it's loaded
// console.log("JWT_SECRET in controller:", process.env.JWT_SECRET );

// Signup API
export const Signup = async (req, res) => {
    try {
        const { name, phoneNumber, password } = req.body;

        // Validate required fields
        if (!name || !phoneNumber || !password) {
            return res.status(400).json({ message: "Name, phone number, and password are required", success: false });
        }

        // Validate phone number format
        const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
        if (!phoneRegex.test(phoneNumber)) {
            return res.status(400).json({ message: "Invalid phone number format", success: false });
        }

        // Check for existing user
        const existingUser = await User.findOne({ phoneNumber });
        if (existingUser) {
            return res.status(409).json({ message: "Phone number already registered", success: false });
        }

        // Create new user
        const user = new User({ name, phoneNumber, password });
        await user.save();

        // Generate JWT token
        if (!process.env.JWT_SECRET) {
            throw new Error("JWT_SECRET is not defined");
        }
        const token = jwt.sign(
            { id: user._id, role: user.role || "user" },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRE || "7d" }
        );

        res.status(201).json({
            message: "Signup successful",
            success: true,
            user: user.getPublicProfile(),
            token,
        });
    } catch (error) {
        console.error("Signup error:", error);
        if (error.code === 11000) {
            return res.status(409).json({ message: "Phone number already registered", success: false });
        }
        res.status(500).json({ message: "Server error during signup: " + error.message, success: false });
    }
};

// Login API
export const Login = async (req, res) => {
    try {
        const { phoneNumber, password } = req.body;

        // Validate required fields
        if (!phoneNumber || !password) {
            return res.status(400).json({ message: "Phone number and password are required", success: false });
        }

        // Validate phone number format
        const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
        if (!phoneRegex.test(phoneNumber)) {
            return res.status(400).json({ message: "Invalid phone number format", success: false });
        }

        // Find user by phone number (include password for comparison)
        const user = await User.findOne({ phoneNumber }).select("+password");
        if (!user) {
            return res.status(401).json({ message: "Invalid phone number or password", success: false });
        }

        // Compare password
        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.status(401).json({ message: "Invalid phone number or password", success: false });
        }

        // Generate JWT token
        if (!process.env.JWT_SECRET) {
            throw new Error("JWT_SECRET is not defined");
        }
        const token = jwt.sign(
            { id: user._id, role: user.role || "user" },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRE || "7d" }
        );

        res.status(200).json({
            message: "Login successful",
            success: true,
            user: user.getPublicProfile(),
            token,
        });
    } catch (error) {
        console.error("Login error:", error);
        res.status(500).json({ message: "Server error during login: " + error.message, success: false });
    }
};