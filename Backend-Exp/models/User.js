import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        unique: true,
        sparse: true // Allows null values but enforces uniqueness for non-null values
    },
    phone: {
        type: String,
        required: true,
        unique: true
    },
    password_hash: {
        type: String,
        required: true
    },
    role: {
        type: String,
        enum: ['farmer', 'buyer', 'supplier', 'admin'],
        required: true
    },
    language_pref: {
        type: String,
        default: 'en'
    },
    trust_score: {
        type: Number,
        default: 0.0
    }
}, {
  timestamps: true // This will add createdAt and updatedAt fields
});

export default mongoose.model("User", userSchema);