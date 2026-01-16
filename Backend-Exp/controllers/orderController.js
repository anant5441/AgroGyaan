import Order from '../models/Order.js';
import CropListing from '../models/CropListing.js';

// Get all orders for logged-in buyer
export const getOrders = async (req, res) => {
    try {
        const buyerId = req.user._id;  // From auth middleware (we'll explain this)

        // Find all orders for this buyer
        const orders = await Order.find({ buyer_id: buyerId })
            .populate({
                path: 'crop_id',
                select: 'crop_name price_per_unit_retail farmer_id',
                populate: {
                    path: 'farmer_id',
                    select: 'name' // Get farmer's name
                }
            })
            .populate('buyer_id', 'name email')
            .sort({ createdAt: -1 });

        res.status(200).json({ success: true, data: orders });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Get single order
export const getOrderById = async (req, res) => {
    try {
        const { id } = req.params;  // From URL: /api/orders/:id

        const order = await Order.findById(id)
            .populate('crop_id')
            .populate('buyer_id');

        if (!order) {
            return res.status(404).json({ success: false, message: 'Order not found' });
        }

        res.status(200).json({ success: true, data: order });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Create new order
// Create new order
export const createOrder = async (req, res) => {
    try {
        console.log('📦 Create Order Request:', req.body);
        const { crop_id, quantity } = req.body;
        const buyer_id = req.user._id;
        console.log('👤 Buyer ID:', buyer_id);

        // Get crop to calculate price
        const crop = await CropListing.findById(crop_id);
        if (!crop) {
            console.log('❌ Crop not found for ID:', crop_id);
            return res.status(404).json({ success: false, message: 'Crop not found' });
        }

        // CHECK INVENTORY
        if (crop.Quantity_available_retail < quantity) {
            return res.status(400).json({ success: false, message: `Insufficient stock! Only ${crop.Quantity_available_retail} available.` });
        }

        console.log('✅ Crop found:', crop.crop_name, 'Price:', crop.price_per_unit_retail);

        const price = crop.price_per_unit_retail || crop.price_per_unit_wholesale || 0;
        const price_total = price * quantity;
        console.log('💰 calculated total:', price_total);

        // Create order
        const order = await Order.create({
            buyer_id,
            crop_id,
            quantity,
            price_total,
            status: 'pending'
        });

        // DEDUCT INVENTORY
        crop.Quantity_available_retail -= quantity;
        await crop.save();

        console.log('✅ Order created & Inventory updated:', order._id);
        res.status(201).json({ success: true, data: order });
    } catch (error) {
        console.error('❌ Create Order Error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// Update order status
export const updateOrderStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        const order = await Order.findById(id);

        if (!order) {
            return res.status(404).json({ success: false, message: 'Order not found' });
        }

        // RESTORE INVENTORY IF CANCELLED
        if (status === 'cancelled' && order.status !== 'cancelled') {
            const crop = await CropListing.findById(order.crop_id);
            if (crop) {
                crop.Quantity_available_retail += order.quantity;
                await crop.save();
                console.log('🔄 Inventory restored for cancelled order:', id);
            }
        }

        order.status = status;
        await order.save();

        res.status(200).json({ success: true, data: order });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Reorder functionality
export const reorder = async (req, res) => {
    try {
        const { id } = req.params;
        const buyer_id = req.user._id;

        // Find the original order
        const originalOrder = await Order.findById(id);
        if (!originalOrder) {
            return res.status(404).json({ success: false, message: 'Original order not found' });
        }

        // Check if crop still exists
        const crop = await CropListing.findById(originalOrder.crop_id);
        if (!crop) {
            return res.status(404).json({ success: false, message: 'Crop is no longer available' });
        }

        // Recalculate price (prices may have changed)
        const price = crop.price_per_unit_retail || crop.price_per_unit_wholesale || 0;
        const price_total = price * originalOrder.quantity;

        // Create new order
        const newOrder = await Order.create({
            buyer_id,
            crop_id: originalOrder.crop_id,
            quantity: originalOrder.quantity,
            price_total,
            status: 'pending'
        });

        res.status(201).json({
            success: true,
            message: 'Reorder placed successfully',
            data: newOrder
        });

    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};