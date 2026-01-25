import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import {
    createEquipmentOrder,
    getMyEquipmentOrders,
    getSupplierOrders,
    updateEquipmentOrderStatus
} from '../controllers/equipmentOrderController.js';

const router = express.Router();

// All routes require authentication
router.use(protect);

router.post('/', createEquipmentOrder);
router.get('/', getMyEquipmentOrders);          // Buyer's orders
router.get('/supplier', getSupplierOrders);     // Supplier's received orders
router.patch('/:id/status', updateEquipmentOrderStatus);

export default router;
