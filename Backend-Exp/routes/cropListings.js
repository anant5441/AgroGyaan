import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import { getCropListings, getCropListingById, createCropListing, updateCropListing, deleteCropListing } from "../controllers/cropListingController.js";

const router = express.Router();

// Public routes (anyone can view crops)
router.get("/", getCropListings);
router.get("/:id", getCropListingById);

// Protected routes (require authentication)
router.post("/", protect, createCropListing);
router.put("/:id", protect, updateCropListing);
router.delete("/:id", protect, deleteCropListing);

export default router;  