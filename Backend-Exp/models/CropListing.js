import mongoose from "mongoose";

const cropListingSchema = new mongoose.Schema({
    farmer_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Farmer',
        required: true
    },
    crop_name: {
        type: String,
        required: true
    },
    variety: String,
    Quantity_available_retail: Number,
    Quantity_available_wholesale: Number,
    unit_retail: {
        type: String,
        enum: ['kg', 'quintal', 'ton']
    },
    unit_wholesale: {
        type: String,
        enum: ['kg', 'quintal', 'ton']
    },
    price_per_unit_retail: Number,
    price_per_unit_wholesale: Number,
    sale_type: {
        type: String,
        enum: ['retail', 'wholesale', 'both'],
        required: true
    },
    organic_certified: {
        type: Boolean,
        default: false
    },
    listing_status: {
        type: String,
        enum: ['active', 'sold'],
        default: 'active'
    }
    }, {
    timestamps: true
});

export default mongoose.model("CropListing", cropListingSchema);