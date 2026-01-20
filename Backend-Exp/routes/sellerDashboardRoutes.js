import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import { getSellerStats, getRecentSellerOrders } from "../controllers/sellerDashboardController.js";

const router = express.Router();

router.get("/stats", protect, getSellerStats);
router.get("/recent-orders", protect, getRecentSellerOrders);

export default router;
