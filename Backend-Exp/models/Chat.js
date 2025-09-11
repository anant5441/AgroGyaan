import mongoose from "mongoose";

const chatSchema = new mongoose.Schema({
    sender_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    receiver_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    message: {
        type: String,
        required: true
    },
    message_type: {
        type: String,
        enum: ['text', 'image', 'file'],
        default: 'text'
    },
    is_read: {
        type: Boolean,
        default: false
    }
    }, {
    timestamps: true
});

export default mongoose.model("Chat", chatSchema);
