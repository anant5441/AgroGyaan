import mongoose from "mongoose";

const marketPriceSchema = new mongoose.Schema({
    crop_name: {
        type: String,
        required: true
    },
    mandi_location: {
        type: String,
        required: true
    },
    price_per_unit: {
        type: Number,
        required: true
    },
    unit: {
        type: String,
        required: true
    }
    }, {
    timestamps: true
});

export default mongoose.model("MarketPrice", marketPriceSchema);