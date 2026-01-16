import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import { getCart, addToCart, removeFromCart, checkout } from "../controllers/cartController.js";

const router = express.Router();

router.get("/", protect, getCart);
router.post("/add", protect, addToCart);
router.delete("/:itemId", protect, removeFromCart);
router.post("/checkout", protect, checkout);

export default router;
