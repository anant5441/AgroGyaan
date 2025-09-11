import mongoose from "mongoose";

const buyerSchema = new mongoose.Schema({
    buyer_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        unique: true
    },
    buyer_type: {
        type: String,
        enum: ['retail', 'business'],
        required: true
    },
    company_name: String,
    gst_number: String,
    address: String
});

export default mongoose.model("Buyer", buyerSchema);
