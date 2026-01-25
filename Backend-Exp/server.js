import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./config/database.js";

// Import Routes
import authRoutes from "./routes/auth.js";
import cropListingRoutes from "./routes/cropListings.js";
import userRoutes from "./routes/users.js";
import orderRoutes from './routes/orders.js';
import cartRoutes from "./routes/cart.js";
import dashboardRoutes from "./routes/dashboardRoutes.js";
import sellerDashboardRoutes from "./routes/sellerDashboardRoutes.js";
import equipmentListingRoutes from "./routes/equipmentListings.js";
import equipmentOrderRoutes from "./routes/equipmentOrders.js";

// Import Middleware
import { errorHandler, notFound } from "./middleware/errorMiddleware.js";

dotenv.config();

console.log("Starting AgroGyaan Backend Server...");

// Check if JWT_SECRET is set
if (!process.env.JWT_SECRET) {
  console.error("FATAL ERROR: JWT_SECRET is not defined.");
  process.exit(1);
}

const app = express();
const PORT = process.env.PORT || 5678;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: '✅ OK',
    database: mongoose.connection.readyState === 1 ? '✅ Connected' : '❌ Disconnected',
  });
});

// Test route
app.get('/api/test', (req, res) => {
  res.json({
    message: '✅ API is working!',
    version: '1.0.0'
  });
});

// Use routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/crop-listings", cropListingRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/seller-dashboard', sellerDashboardRoutes);
app.use('/api/equipment-listings', equipmentListingRoutes);
app.use('/api/equipment-orders', equipmentOrderRoutes);

app.get('/api/users/debug', (req, res) => {
  res.json({ message: 'User routes are working!' });
});

// 404 Handler - MUST be after all routes
app.use(notFound);

// Error Handler - MUST be the last middleware
app.use(errorHandler);

app.listen(PORT, async () => {
  await connectDB();
  console.log(`🚀 Server running on http://127.0.0.1:${PORT}`);
});
