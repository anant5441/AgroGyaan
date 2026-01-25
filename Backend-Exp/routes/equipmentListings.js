import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import {
    getEquipmentListings,
    getEquipmentListingById,
    createEquipmentListing,
    updateEquipmentListing,
    deleteEquipmentListing,
    getMyEquipmentListings
} from "../controllers/equipmentListingController.js";

const router = express.Router();

// Public routes
router.get("/", getEquipmentListings);
router.get("/:id", getEquipmentListingById);

// Protected routes (require info about logged in user)
router.post("/", protect, createEquipmentListing);
router.put("/:id", protect, updateEquipmentListing);
router.delete("/:id", protect, deleteEquipmentListing);
router.get("/my/listings", protect, getMyEquipmentListings); // Changed path slightly to avoid conflict if I used /my-listings

export default router;
