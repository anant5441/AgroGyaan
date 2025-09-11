import mongoose from "mongoose";

const equipmentOrderSchema = new mongoose.Schema({
    buyer_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Buyer',
        required: true
    },
    equipment_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'EquipmentListing',
        required: true
    },
    supplier_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Supplier',
        required: true
    },
    order_type: {
        type: String,
        enum: ['rent', 'buy'],
        required: true
    },
    start_date: Date,
    end_date: Date,
    price_total: {
        type: Number,
        required: true
    },
    status: {
        type: String,
        enum: ['pending', 'confirmed', 'completed', 'cancelled'],
        default: 'pending'
    }
    }, {
    timestamps: true
});

export default mongoose.model("EquipmentOrder", equipmentOrderSchema);
