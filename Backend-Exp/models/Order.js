import mongoose from "mongoose";

const orderSchema = new mongoose.Schema({
    buyer_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Buyer',
        required: true
    },
    farmer_ids: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Farmer',
        required: true
    }],
    crop_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'CropListing',
        required: true
    },
    quantity: {
        type: Number,
        required: true
    },
    price_total: {
        type: Number,
        required: true
    },
    order_type: {
        type: String,
        enum: ['retail', 'bulk'],
        required: true
    },
    status: {
        type: String,
        enum: ['pending', 'confirmed', 'dispatched', 'delivered', 'cancelled'],
        default: 'pending'
    },
    payment_status: {
        type: String,
        enum: ['pending', 'paid', 'escrow', 'refunded'],
        default: 'pending'
    },
    logistics_required: {
        type: Boolean,
        default: false
    },
    delivery_address: String
    }, {
    timestamps: true
});

export default mongoose.model("Order", orderSchema);