import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./config/database.js";
import authRoutes from "./routes/auth.js";
import { errorHandler, notFound } from "./middleware/errorMiddleware.js";
import userRoutes from "./routes/users.js";
import cropListingRoutes from "./routes/cropListings.js";

// Import controllers
import {
  getUserById,
  updateUser,
  deleteUser
} from "./controllers/userController.js";

import {
  getCropListings,
  getCropListingById,
  createCropListing,
  updateCropListing,
  deleteCropListing
} from "./controllers/cropListingController.js";

dotenv.config();

console.log("🚀 Starting AgroGyaan Backend Server...");

// Check if JWT_SECRET is set
if (!process.env.JWT_SECRET) {
    console.error("FATAL ERROR: JWT_SECRET is not defined.");
    process.exit(1);
}

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging middleware
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
    next();
});

// ==================== ROUTES ====================

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: '✅ OK', 
    database: mongoose.connection.readyState === 1 ? '✅ Connected' : '❌ Disconnected',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Test route
app.get('/api/test', (req, res) => {
  res.json({ 
    message: '✅ API is working!',
    version: '1.0.0'
  });
});

// Auth routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/crop-listings", cropListingRoutes);

// ==================== USER ROUTES ====================


// Get user by ID
app.get('/api/users/:id', getUserById);


// Update user by ID
app.put('/api/users/:id', updateUser);

// Delete user by ID
app.delete('/api/users/:id', deleteUser);

// ==================== CROP LISTING ROUTES ====================

// Get all crop listings
app.get('/api/crop-listings', getCropListings);

// Get crop listing by ID
app.get('/api/crop-listings/:id', getCropListingById);

// Create a crop listing
app.post('/api/crop-listings', createCropListing);

// Update crop listing by ID
app.put('/api/crop-listings/:id', updateCropListing);

// Delete crop listing by ID
app.delete('/api/crop-listings/:id', deleteCropListing);

// ==================== PROTECTED ROUTE EXAMPLE ====================

app.get('/api/protected', (req, res) => {
  res.json({ 
    message: 'This is a protected route (add auth middleware)',
    timestamp: new Date().toISOString()
  });
});

// ==================== ERROR HANDLING MIDDLEWARE ====================

// 404 Handler - MUST be after all routes
app.use(notFound);

// Error Handler - MUST be the last middleware
app.use(errorHandler);

// ==================== SERVER START ====================

// Connect to MongoDB and start server
connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`✅ Server is running on port ${PORT}`);
    console.log(`🌐 Health check: http://localhost:${PORT}/api/health`);
    console.log(`🔗 API test: http://localhost:${PORT}/api/test`);
    console.log(`👥 Users API: http://localhost:${PORT}/api/users`);
    console.log(`🌾 Crop listings: http://localhost:5000/api/crop-listings`);
  });
}).catch((error) => {
  console.error("❌ Database connection failed", error);
  process.exit(1);
});