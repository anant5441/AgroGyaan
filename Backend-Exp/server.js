  import express from "express";
  import mongoose from "mongoose";
  import cors from "cors";
  import dotenv from "dotenv";
  import connectDB from "./config/database.js";
  import orderRoutes from './routes/orders.js';

  // Import routes 
  import authRoutes from "./routes/auth.js";
  import cropListingRoutes from "./routes/cropListings.js";
  import userRoutes from "./routes/users.js";

  // Import Middleware
  import { errorHandler, notFound } from "./middleware/errorMiddleware.js";


  // Import controllers
  // import {
  //   getUserById,
  //   updateUser,
  //   deleteUser
  // } from "./controllers/userController.js";

  // import {
  //   getCropListings,
  //   getCropListingById,
  //   createCropListing,
  //   updateCropListing,
  //   deleteCropListing
  // } from "./controllers/cropListingController.js";

  dotenv.config();

  console.log("Starting AgroGyaan Backend Server...");

  // Check if JWT_SECRET is set
  if (!process.env.JWT_SECRET) {
      console.error("FATAL ERROR: JWT_SECRET is not defined.");
      process.exit(1);
  }

  const app = express();
  const PORT = process.env.PORT || 5000;

  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  //Request logging middleware
  app.use((req, res, next) => {
      console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
      next();
  });


  app.head('/', (req, res) => {
    res.status(200).end();
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

