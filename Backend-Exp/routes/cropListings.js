import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import { getCropListings, getCropListingById, createCropListing, updateCropListing, deleteCropListing } from "../controllers/cropListingController.js";

import { getMyListings } from '../controllers/cropListingController.js';

const router = express.Router();

// Public routes (anyone can view crops)
router.get("/", getCropListings);

// Protected routes (require authentication)
router.post("/", protect, createCropListing);
router.put("/:id", protect, updateCropListing);
router.delete("/:id", protect, deleteCropListing);


router.get('/my-listings', protect, getMyListings);
router.get("/:id", getCropListingById);

export default router;  