import CropListing from "../models/CropListing.js";

// Get all crop listings
export const getCropListings = async (req, res, next) => {
  try {
    const { search, organic, minPrice, maxPrice } = req.query;

    // Build query object
    let query = { listing_status: 'active' }; // Default: show only active listings

    // Search filter (Crop Name OR Farmer Name - requires lookup but for now simplistic approach on crop name)
    if (search) {
      query.crop_name = { $regex: search, $options: 'i' }; // Case-insensitive partial match
    }

    // Organic filter
    if (organic === 'true') {
      query.organic_certified = true;
    }

    // Price filtering (optional addition)
    if (minPrice || maxPrice) {
      query.price_per_unit_retail = {};
      if (minPrice) query.price_per_unit_retail.$gte = Number(minPrice);
      if (maxPrice) query.price_per_unit_retail.$lte = Number(maxPrice);
    }

    const cropListings = await CropListing.find(query)
      .populate('farmer_id', 'name email phone') // Populate farmer details
      .sort({ createdAt: -1 });

    res.json(cropListings);
  } catch (error) {
    next(error);
  }
};

// Get crop listing by ID
export const getCropListingById = async (req, res, next) => {
  try {
    const cropListing = await CropListing.findById(req.params.id)
      .populate('farmer_id', 'name email phone');

    if (!cropListing) {
      const error = new Error('Crop listing not found');
      error.statusCode = 404;
      error.code = 'CROP_LISTING_NOT_FOUND';
      throw error;
    }

    res.json(cropListing);
  } catch (error) {
    next(error);
  }
};

// Create a crop listing
export const createCropListing = async (req, res, next) => {
  try {
    // Automatically add farmer_id from authenticated user
    const cropListingData = {
      ...req.body,
      farmer_id: req.user._id  // Add logged-in farmer's ID
    };

    const cropListing = new CropListing(cropListingData);
    const savedCropListing = await cropListing.save();

    await savedCropListing.populate('farmer_id', 'name email phone');

    res.status(201).json(savedCropListing);
  } catch (error) {
    next(error);
  }
};

// Update crop listing by ID
export const updateCropListing = async (req, res, next) => {
  try {
    const cropListing = await CropListing.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true
      }
    ).populate('farmer_id', 'name email phone');

    if (!cropListing) {
      const error = new Error('Crop listing not found');
      error.statusCode = 404;
      error.code = 'CROP_LISTING_NOT_FOUND';
      throw error;
    }

    res.json({
      message: 'Crop listing updated successfully',
      cropListing
    });
  } catch (error) {
    next(error);
  }
};

// Delete crop listing by ID
export const deleteCropListing = async (req, res, next) => {
  try {
    const cropListing = await CropListing.findByIdAndDelete(req.params.id);

    if (!cropListing) {
      const error = new Error('Crop listing not found');
      error.statusCode = 404;
      error.code = 'CROP_LISTING_NOT_FOUND';
      throw error;
    }

    res.json({
      message: 'Crop listing deleted successfully',
      cropListing: {
        id: cropListing._id,
        crop_name: cropListing.crop_name,
        farmer_id: cropListing.farmer_id
      }
    });
  } catch (error) {
    next(error);
  }
};