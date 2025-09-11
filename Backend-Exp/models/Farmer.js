import mongoose from "mongoose";

const farmerSchema = new mongoose.Schema({
    farmer_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        unique: true
    },
    farm_location: {
        type: {
        type: String,
        enum: ['Point'],
        required: true
        },
        coordinates: {
        type: [Number],
        required: true
        }
    },
    soil_type: String,
    farming_practices: String,
    experience_years: Number,
    community_points: {
        type: Number,
        default: 0
    }
});

// Create a geospatial index for location-based queries
farmerSchema.index({ farm_location: '2dsphere' });

export default mongoose.model("Farmer", farmerSchema);