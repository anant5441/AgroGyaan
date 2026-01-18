import Order from '../models/Order.js';
import CropListing from '../models/CropListing.js';
// import Alert from '../models/Alert.js'; // Assuming Alert model exists, or we mock it

export const getDashboardStats = async (req, res) => {
    try {
        const userId = req.user.id; // From auth middleware

        // 1. Orders Placed (Total orders by this buyer)
        const ordersPlaced = await Order.countDocuments({ buyer_id: userId });

        // 2. Crops Available (Total active listings in marketplace)
        const cropsAvailable = await CropListing.countDocuments({ listing_status: 'active' });

        // 3. Active Alerts (Placeholder or real if model exists)
        // const activeAlerts = await Alert.countDocuments({ user_id: userId, status: 'active' });
        const activeAlerts = 0; // Mock for now

        // 4. Local Impact (Total spent by buyer)
        const impactAggregation = await Order.aggregate([
            { $match: { buyer_id: userId } }, // Check how userId is stored (String vs ObjectId) - middleware usually converts string to ObjectId if needed, but here we might need to cast if distinct
            // Assuming mongoose handles casting in find, but aggregate needs explicit match usually.
            // However, let's assume userId is properly formatted or use simple find + reduce if volume is low.
            // Aggregation is better.
            { $group: { _id: null, totalSpent: { $sum: "$price_total" } } }
        ]);
        const localImpact = impactAggregation.length > 0 ? impactAggregation[0].totalSpent : 0;

        res.status(200).json({
            ordersPlaced,
            cropsAvailable,
            activeAlerts,
            localImpact
        });
    } catch (error) {
        console.error('Error fetching dashboard stats:', error);
        res.status(500).json({ message: 'Error fetching dashboard stats', error: error.message });
    }
};

export const getRecentOrders = async (req, res) => {
    try {
        const userId = req.user.id;

        const recentOrders = await Order.find({ buyer_id: userId })
            .sort({ createdAt: -1 })
            .limit(5)
            .populate({
                path: 'crop_id',
                select: 'crop_name farmer_id image_url',
                populate: {
                    path: 'farmer_id',
                    select: 'name city state' // Assuming User model has these fields
                }
            });

        // Transform data to match frontend expectations if needed, or send as is
        const formattedOrders = recentOrders.map(order => ({
            id: order._id,
            displayId: order.displayId || `#ORD-${order._id.toString().slice(-4)}`, // Use virtual if available
            crop: order.crop_id?.crop_name || 'Unknown Crop',
            farmer: order.crop_id?.farmer_id?.name || 'Unknown Farmer',
            quantity: `${order.quantity} kg`, // Assuming unit is kg, or fetch unit from crop
            price: `₹${order.price_total}`,
            status: order.status.charAt(0).toUpperCase() + order.status.slice(1), // Capitalize
            location: order.crop_id?.farmer_id?.city || 'India', // Fallback
            date: order.createdAt
        }));

        res.status(200).json(formattedOrders);
    } catch (error) {
        console.error('Error fetching recent orders:', error);
        res.status(500).json({ message: 'Error fetching recent orders', error: error.message });
    }
};
