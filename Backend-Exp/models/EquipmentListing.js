import mongoose from "mongoose";

const equipmentListingSchema = new mongoose.Schema({
    supplier_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Supplier',
        required: true
    },
    name: {
        type: String,
        required: true
    },
    type: String,
    description: String,
    price: Number,
    listing_type: {
        type: String,
        enum: ['sale', 'rent'],
        required: true
    },
    availability: {
        type: Boolean,
        default: true
    },
    location: {
        type: {
        type: String,
        enum: ['Point'],
        required: true
        },
        coordinates: {
        type: [Number],
        required: true
        }
    }
    }, {
    timestamps: true
});

// Create a geospatial index for location-based queries
equipmentListingSchema.index({ location: '2dsphere' });

export default mongoose.model("EquipmentListing", equipmentListingSchema);