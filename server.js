import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import connectDB from "./config/db.js";
import userRoutes from "./routes/user/userRoutes.js";
import adminRoutes from "./routes/admin/adminRoute.js";
import productRoutes from "./routes/products/productRoutes.js"
import bannerRoutes from "./routes/admin/bannerRoutes.js";
import newArrivalRoutes from "./routes/products/newArrivalRoutes.js";
import seasonTopPickRoutes from "./routes/products/seasonTopPickRoutes.js";
import trendingCategoryRoutes from "./routes/products/trendingCategoryRoutes.js";
import cartRoutes from "./routes/cartRoutes.js";


// Load environment variables
dotenv.config();

// Connect to MongoDB
connectDB();

// Create Express app
const app = express();

// CORS configuration
const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    const allowedOrigins = [
      'http://localhost:5173', // Vite default port
      'http://localhost:3000', // React default port
      'http://localhost:8080', // Vue default port
      'http://127.0.0.1:5173',
      'http://127.0.0.1:3000',
      'http://127.0.0.1:8080',
      process.env.FRONTEND_URL // From environment variable
    ].filter(Boolean);
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true, // Allow cookies and authentication headers
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: [
    'Origin',
    'X-Requested-With',
    'Content-Type',
    'Accept',
    'Authorization',
    'Cache-Control',
    'X-Auth-Token'
  ],
  exposedHeaders: ['Content-Range', 'X-Content-Range'],
  maxAge: 86400 // Cache preflight response for 24 hours
};

// Middleware
app.use(cors(corsOptions));
app.use(express.json({ limit: '10mb' })); 
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Handle preflight requests
app.options('*', cors(corsOptions));

// Server listen
const PORT = process.env.PORT || 8000;

app.get("/", (req, res) => {
  res.send("API is running...");
});

// Health check endpoint
app.get("/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "API is healthy",
    timestamp: new Date().toISOString()
  });
});

// Routes
app.use("/api/user", userRoutes);
app.use("/api/admin", adminRoutes);
app.use('/api/products', productRoutes);
app.use("/api/admin/banners", bannerRoutes);
app.use("/api/products/new-arrival", newArrivalRoutes);
app.use("/api/products/season-top-picks", seasonTopPickRoutes);
app.use("/api/products/trending-categories", trendingCategoryRoutes);
app.use("/api/cart", cartRoutes);


connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    
  });
});