import express from 'express';
import { protect } from '../middleware/authMiddleware.js';  // Auth middleware
import { getFarmerOrders } from '../controllers/orderController.js';

import {
    getOrders,
    getOrderById,
    createOrder,
    updateOrderStatus,
    reorder
} from '../controllers/orderController.js';

const router = express.Router();

// All routes require authentication
router.use(protect);  // Middleware applies to all routes below

router.get('/', getOrders);                    // GET /api/orders
router.get('/farmer', protect, getFarmerOrders);
router.get('/:id', getOrderById);              // GET /api/orders/123
router.post('/', createOrder);                 // POST /api/orders
router.patch('/:id/status', updateOrderStatus); // PATCH /api/orders/123/status
router.post('/:id/reorder', reorder);           // POST /api/orders/123/reorder
router.get('/farmer', protect, getFarmerOrders);

export default router;