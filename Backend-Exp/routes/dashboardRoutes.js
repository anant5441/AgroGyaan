import express from 'express';
import { getDashboardStats, getRecentOrders } from '../controllers/dashboardController.js';
import { protect } from '../middleware/authMiddleware.js'; // Assuming auth middleware exists

const router = express.Router();

router.get('/stats', protect, getDashboardStats);
router.get('/recent-orders', protect, getRecentOrders);

export default router;
