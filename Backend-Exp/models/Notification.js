import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema({
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    title: {
        type: String,
        required: true
    },
    message: {
        type: String,
        required: true
    },
    type: {
        type: String,
        enum: ['order', 'chat', 'price', 'system', 'weather'],
        required: true
    },
    is_read: {
        type: Boolean,
        default: false
    }
    }, {
    timestamps: true
});

export default mongoose.model("Notification", notificationSchema);