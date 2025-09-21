import express from "express";
import {
  getCropListings,
  getCropListingById,
  createCropListing,
  updateCropListing,
  deleteCropListing
} from "../controllers/cropListingController.js";

const router = express.Router();

router.get("/", getCropListings);
router.get("/:id", getCropListingById);
router.post("/", createCropListing);
router.put("/:id", updateCropListing);
router.delete("/:id", deleteCropListing);

export default router;