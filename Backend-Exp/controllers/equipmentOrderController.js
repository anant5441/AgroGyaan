import EquipmentOrder from "../models/EquipmentOrder.js";
import EquipmentListing from "../models/EquipmentListing.js";

// Create new order (Buyer)
export const createEquipmentOrder = async (req, res, next) => {
    try {
        console.log('📦 Create Equipment Order Request:', req.body);
        const { equipment_id, start_date, end_date, price_total } = req.body; // Basic structure
        const buyer_id = req.user._id;

        const equipment = await EquipmentListing.findById(equipment_id);
        if (!equipment) {
            return res.status(404).json({ success: false, message: 'Equipment not found' });
        }

        // Logic for checking availability could be added here (e.g. check overlapping dates for rent)

        const order = await EquipmentOrder.create({
            buyer_id,
            equipment_id,
            supplier_id: equipment.supplier_id,
            order_type: equipment.listing_type, // 'sale' or 'rent' usually matches listing type
            start_date,
            end_date,
            price_total,
            status: 'pending'
        });

        res.status(201).json({ success: true, data: order });
    } catch (error) {
        next(error);
    }
};

// Get my orders (Buyer)
export const getMyEquipmentOrders = async (req, res, next) => {
    try {
        const orders = await EquipmentOrder.find({ buyer_id: req.user._id })
            .populate('equipment_id')
            .populate('supplier_id', 'name email phone')
            .sort({ createdAt: -1 });

        res.json({ success: true, data: orders });
    } catch (error) {
        next(error);
    }
};

// Get orders received (Supplier)
export const getSupplierOrders = async (req, res, next) => {
    try {
        const orders = await EquipmentOrder.find({ supplier_id: req.user._id })
            .populate('equipment_id')
            .populate('buyer_id', 'name email phone')
            .sort({ createdAt: -1 });

        res.json({ success: true, data: orders });
    } catch (error) {
        next(error);
    }
};

// Update order status (Supplier/Admin)
export const updateEquipmentOrderStatus = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        const order = await EquipmentOrder.findOne({
            _id: id,
            supplier_id: req.user._id // Verify ownership/recipient
        });

        if (!order) {
            return res.status(404).json({ success: false, message: 'Order not found or unauthorized' });
        }

        order.status = status;
        await order.save();

        res.json({ success: true, data: order });
    } catch (error) {
        next(error);
    }
};
