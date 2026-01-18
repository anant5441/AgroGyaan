import EquipmentListing from '../models/EquipmentListing.js';
import EquipmentOrder from '../models/EquipmentOrder.js';
import User from '../models/User.js';

export const getSellerStats = async (req, res) => {
    try {
        const supplierId = req.user.id;

        const totalListings = await EquipmentListing.countDocuments({ supplier_id: supplierId });
        const pendingRequests = await EquipmentOrder.countDocuments({ supplier_id: supplierId, status: 'pending' });
        const activeRentals = await EquipmentOrder.countDocuments({
            supplier_id: supplierId,
            status: { $in: ['confirmed', 'active'] },
            order_type: 'rent'
        });

        // Calculate total earnings from completed orders
        const earningsAggregation = await EquipmentOrder.aggregate([
            { $match: { supplier_id: supplierId, status: 'completed' } },
            { $group: { _id: null, total: { $sum: "$price_total" } } }
        ]);
        const totalEarnings = earningsAggregation.length > 0 ? earningsAggregation[0].total : 0;

        res.status(200).json({
            totalListings,
            pendingRequests,
            activeRentals,
            totalEarnings
        });
    } catch (error) {
        console.error('Error fetching seller stats:', error);
        res.status(500).json({ message: 'Error fetching seller dashboard stats', error: error.message });
    }
};

export const getRecentSellerOrders = async (req, res) => {
    try {
        const supplierId = req.user.id;

        const recentOrders = await EquipmentOrder.find({ supplier_id: supplierId })
            .sort({ createdAt: -1 })
            .limit(5)
            .populate('buyer_id', 'name email mobile_number')
            .populate('equipment_id', 'name listing_type');

        res.status(200).json(recentOrders);
    } catch (error) {
        console.error('Error fetching recent seller orders:', error);
        res.status(500).json({ message: 'Error fetching recent orders', error: error.message });
    }
};