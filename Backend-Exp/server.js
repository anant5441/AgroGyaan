import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./config/database.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Connect to MongoDB using the imported function
connectDB();

// Routes for testing
app.get('/api/test', (req, res) => {
    res.json({ message: 'API is working!' });
});

// Create a new user
// Update your POST /api/users route
app.post('/api/users', async (req, res) => {
    try {
        console.log('Received data:', req.body); // Add this for debugging
        
        const User = (await import('./models/User.js')).default;
        const user = new User(req.body);
        const savedUser = await user.save();
        res.status(201).json(savedUser);
    } catch (error) {
        console.error('Error creating user:', error); // Add this for debugging
        res.status(400).json({ error: error.message });
    }
});

// Get all users
app.get('/api/users', async (req, res) => {
    try {
        const User = (await import('./models/User.js')).default;
        const users = await User.find();
        res.json(users);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Create a crop listing
app.post('/api/crop-listings', async (req, res) => {
    try {
        const CropListing = (await import('./models/CropListing.js')).default;
        const cropListing = new CropListing(req.body);
        const savedCropListing = await cropListing.save();
        res.status(201).json(savedCropListing);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Get all crop listings
app.get('/api/crop-listings', async (req, res) => {
    try {
        const CropListing = (await import('./models/CropListing.js')).default;
        const cropListings = await CropListing.find().populate('farmer_id');
        res.json(cropListings);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Start server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});