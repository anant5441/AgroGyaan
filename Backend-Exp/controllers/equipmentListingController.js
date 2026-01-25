import EquipmentListing from "../models/EquipmentListing.js";

// Get all equipment listings
export const getEquipmentListings = async (req, res, next) => {
    try {
        const { search, type, listing_type, minPrice, maxPrice } = req.query;

        // Build query object
        let query = { availability: true };

        if (search) {
            query.name = { $regex: search, $options: 'i' };
        }

        if (type) {
            query.type = type;
        }

        if (listing_type) {
            query.listing_type = listing_type;
        }

        if (minPrice || maxPrice) {
            query.price = {};
            if (minPrice) query.price.$gte = Number(minPrice);
            if (maxPrice) query.price.$lte = Number(maxPrice);
        }

        const listings = await EquipmentListing.find(query)
            .populate('supplier_id', 'name email phone address')
            .sort({ createdAt: -1 });

        res.json(listings);
    } catch (error) {
        next(error);
    }
};

// Get single listing by ID
export const getEquipmentListingById = async (req, res, next) => {
    try {
        const listing = await EquipmentListing.findById(req.params.id)
            .populate('supplier_id', 'name email phone address');

        if (!listing) {
            const error = new Error('Equipment listing not found');
            error.statusCode = 404;
            throw error;
        }

        res.json(listing);
    } catch (error) {
        next(error);
    }
};

// Create new listing
export const createEquipmentListing = async (req, res, next) => {
    try {
        const listingData = {
            ...req.body,
            supplier_id: req.user._id
        };

        const listing = new EquipmentListing(listingData);
        const savedListing = await listing.save();

        await savedListing.populate('supplier_id', 'name email phone');

        res.status(201).json(savedListing);
    } catch (error) {
        next(error);
    }
};

// Update listing
export const updateEquipmentListing = async (req, res, next) => {
    try {
        const listing = await EquipmentListing.findOneAndUpdate(
            { _id: req.params.id, supplier_id: req.user._id }, // Ensure ownership
            req.body,
            { new: true, runValidators: true }
        ).populate('supplier_id', 'name email phone');

        if (!listing) {
            const error = new Error('Equipment listing not found or unauthorized');
            error.statusCode = 404;
            throw error;
        }

        res.json({
            message: 'Equipment listing updated successfully',
            listing
        });
    } catch (error) {
        next(error);
    }
};

// Delete listing
export const deleteEquipmentListing = async (req, res, next) => {
    try {
        const listing = await EquipmentListing.findOneAndDelete({
            _id: req.params.id,
            supplier_id: req.user._id // Ensure ownership
        });

        if (!listing) {
            const error = new Error('Equipment listing not found or unauthorized');
            error.statusCode = 404;
            throw error;
        }

        res.json({
            message: 'Equipment listing deleted successfully',
            id: req.params.id
        });
    } catch (error) {
        next(error);
    }
};

// Get my listings (for Supplier)
export const getMyEquipmentListings = async (req, res, next) => {
    try {
        const listings = await EquipmentListing.find({ supplier_id: req.user._id })
            .sort({ createdAt: -1 });
        res.json(listings);
    } catch (error) {
        next(error);
    }
};
