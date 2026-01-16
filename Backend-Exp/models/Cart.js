import mongoose from 'mongoose';

const cartSchema = new mongoose.Schema({
    buyer_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        unique: true
    },
    items: [
        {
            crop_id: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'CropListing',
                required: true
            },
            quantity: {
                type: Number,
                required: true,
                min: 1
            }
        }
    ]
}, { timestamps: true });

export default mongoose.model('Cart', cartSchema);
