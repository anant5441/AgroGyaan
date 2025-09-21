import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        // unique: true,
        sparse: true // Allows null values but enforces uniqueness for non-null values
    },
    phone: {
        type: String,
        required: true,
        // unique: true
    },
    password_hash: {
        type: String,
        required: true
    },
    role: {
        type: String,
        enum: ['farmer', 'buyer', 'supplier'],
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

// Compound index to ensure phone+role combination is unique
userSchema.index({ phone: 1, role: 1 }, { unique: true });

// // Compound index to ensure email+role combination is unique (when email exists)
// userSchema.index({ email: 1, role: 1 }, { 
//   unique: true, 
//   sparse: true // Only index documents that have an email field
// });

// Update the updated_at field before saving
userSchema.pre('save', function(next) {
  this.updated_at = Date.now();
  next();
});

export default mongoose.model("User", userSchema);