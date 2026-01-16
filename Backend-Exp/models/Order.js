
import mongoose from "mongoose";

const orderSchema = new mongoose.Schema({
    buyer_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',  // Links to User collection
        required: true
    },
    crop_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'CropListing',  // Links to CropListing collection
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
    status: {
        type: String,
        enum: ['pending', 'confirmed', 'in_transit', 'delivered', 'cancelled'],
        default: 'pending'
    }
}, {
    timestamps: true  // Auto-creates createdAt and updatedAt
});

// Virtual field for display ID
orderSchema.virtual('displayId').get(function() {
    return `ORD-2024-${this._id.toString().slice(-6)}`;
});

export default mongoose.model("Order", orderSchema);