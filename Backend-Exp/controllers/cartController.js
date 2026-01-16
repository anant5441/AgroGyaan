import Cart from '../models/Cart.js';
import CropListing from '../models/CropListing.js';
import Order from '../models/Order.js';

// Get User's Cart
export const getCart = async (req, res, next) => {
    try {
        let cart = await Cart.findOne({ buyer_id: req.user._id }).populate('items.crop_id');

        if (!cart) {
            cart = await Cart.create({ buyer_id: req.user._id, items: [] });
        }

        res.json({ success: true, data: cart });
    } catch (error) {
        next(error);
    }
};

// Add Item to Cart
export const addToCart = async (req, res, next) => {
    try {
        const { crop_id, quantity } = req.body;
        const buyer_id = req.user._id;

        let cart = await Cart.findOne({ buyer_id });

        if (!cart) {
            cart = await Cart.create({ buyer_id, items: [] });
        }

        // Check if item exists
        const itemIndex = cart.items.findIndex(item => item.crop_id.toString() === crop_id);

        if (itemIndex > -1) {
            // Update quantity
            cart.items[itemIndex].quantity += quantity;
        } else {
            // Add new item
            cart.items.push({ crop_id, quantity });
        }

        await cart.save();
        await cart.populate('items.crop_id');

        res.json({ success: true, data: cart });
    } catch (error) {
        next(error);
    }
};

// Remove Item from Cart
export const removeFromCart = async (req, res, next) => {
    try {
        const { itemId } = req.params;
        const buyer_id = req.user._id;

        const cart = await Cart.findOne({ buyer_id });
        if (!cart) return res.status(404).json({ message: "Cart not found" });

        cart.items = cart.items.filter(item => item._id.toString() !== itemId);

        await cart.save();
        await cart.populate('items.crop_id');

        res.json({ success: true, data: cart });
    } catch (error) {
        next(error);
    }
};

// Checkout (Convert Cart to Orders)
export const checkout = async (req, res, next) => {
    try {
        const buyer_id = req.user._id;
        const cart = await Cart.findOne({ buyer_id }).populate('items.crop_id');

        if (!cart || cart.items.length === 0) {
            return res.status(400).json({ success: false, message: "Cart is empty" });
        }

        const orders = [];

        for (const item of cart.items) {
            // Re-fetch crop to ensure we have a fresh document instance for saving
            const crop = await CropListing.findById(item.crop_id._id || item.crop_id);

            // Re-verify inventory
            if (!crop || crop.Quantity_available_retail < item.quantity) {
                return res.status(400).json({
                    success: false,
                    message: `Insufficient stock for ${crop ? crop.crop_name : 'unknown item'}`
                });
            }

            const price_total = (crop.price_per_unit_retail || 0) * item.quantity;

            // Create Order
            const order = await Order.create({
                buyer_id,
                crop_id: crop._id,
                quantity: item.quantity,
                price_total,
                status: 'pending'
            });

            // Deduct Inventory
            crop.Quantity_available_retail -= item.quantity;
            await crop.save();

            orders.push(order);
        }

        // Clear Cart
        cart.items = [];
        await cart.save();

        res.json({
            success: true,
            message: `Successfully placed ${orders.length} orders!`,
            orders
        });

    } catch (error) {
        next(error);
    }
};
