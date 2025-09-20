import Farmer from '../models/Farmer.js';
import { generateToken } from '../middleware/authMiddleware.js';
import { asyncHandler } from '../middleware/errorMiddleware.js';

/**
 * @desc    Register a new farmer
 * @route   POST /api/farmer/register
 * @access  Public
 */
export const registerFarmer = asyncHandler(async (req, res) => {
  const { 
    name, 
    email, 
    password, 
    farmLocation, 
    farmSize, 
    primaryCrops, 
    phoneNumber 
  } = req.body;

  // Check if farmer already exists
  const existingFarmer = await Farmer.findOne({ email });
  if (existingFarmer) {
    return res.status(400).json({
      status: 'error',
      message: 'Farmer with this email already exists',
      code: 'EMAIL_EXISTS'
    });
  }

  // Create new farmer
  const farmer = await Farmer.create({
    name,
    email,
    password,
    farmLocation,
    farmSize,
    primaryCrops,
    phoneNumber
  });

  // Generate JWT token
  const token = generateToken(farmer._id, farmer.role);

  // Update last login
  await farmer.updateLastLogin();

  res.status(201).json({
    status: 'success',
    message: 'Farmer registered successfully',
    data: {
      farmer: farmer.profile,
      token,
      expiresIn: process.env.JWT_EXPIRES_IN || '1h'
    }
  });
});

/**
 * @desc    Login farmer
 * @route   POST /api/farmer/login
 * @access  Public
 */
export const loginFarmer = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  // Find farmer with password field
  const farmer = await Farmer.findByEmailWithPassword(email);
  
  if (!farmer) {
    return res.status(401).json({
      status: 'error',
      message: 'Invalid email or password',
      code: 'INVALID_CREDENTIALS'
    });
  }

  // Check if account is active
  if (!farmer.isActive) {
    return res.status(401).json({
      status: 'error',
      message: 'Account has been deactivated. Please contact support.',
      code: 'ACCOUNT_DEACTIVATED'
    });
  }

  // Verify password
  const isPasswordValid = await farmer.comparePassword(password);
  
  if (!isPasswordValid) {
    return res.status(401).json({
      status: 'error',
      message: 'Invalid email or password',
      code: 'INVALID_CREDENTIALS'
    });
  }

  // Generate JWT token
  const token = generateToken(farmer._id, farmer.role);

  // Update last login
  await farmer.updateLastLogin();

  res.status(200).json({
    status: 'success',
    message: 'Login successful',
    data: {
      farmer: farmer.profile,
      token,
      expiresIn: process.env.JWT_EXPIRES_IN || '1h'
    }
  });
});

/**
 * @desc    Get farmer profile
 * @route   GET /api/farmer/profile
 * @access  Private
 */
export const getFarmerProfile = asyncHandler(async (req, res) => {
  // Farmer data is already attached by auth middleware
  const farmer = req.farmer;

  res.status(200).json({
    status: 'success',
    message: 'Profile retrieved successfully',
    data: {
      farmer: farmer.profile
    }
  });
});

/**
 * @desc    Update farmer profile
 * @route   PUT /api/farmer/profile
 * @access  Private
 */
export const updateFarmerProfile = asyncHandler(async (req, res) => {
  const farmerId = req.farmerId;
  const updateData = req.body;

  // Remove sensitive fields that shouldn't be updated via this route
  delete updateData.password;
  delete updateData.email;
  delete updateData.role;
  delete updateData.isActive;

  const farmer = await Farmer.findByIdAndUpdate(
    farmerId,
    updateData,
    {
      new: true,
      runValidators: true
    }
  );

  if (!farmer) {
    return res.status(404).json({
      status: 'error',
      message: 'Farmer not found',
      code: 'FARMER_NOT_FOUND'
    });
  }

  res.status(200).json({
    status: 'success',
    message: 'Profile updated successfully',
    data: {
      farmer: farmer.profile
    }
  });
});

/**
 * @desc    Change farmer password
 * @route   PUT /api/farmer/change-password
 * @access  Private
 */
export const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  const farmerId = req.farmerId;

  // Get farmer with password
  const farmer = await Farmer.findById(farmerId).select('+password');
  
  if (!farmer) {
    return res.status(404).json({
      status: 'error',
      message: 'Farmer not found',
      code: 'FARMER_NOT_FOUND'
    });
  }

  // Verify current password
  const isCurrentPasswordValid = await farmer.comparePassword(currentPassword);
  
  if (!isCurrentPasswordValid) {
    return res.status(400).json({
      status: 'error',
      message: 'Current password is incorrect',
      code: 'INVALID_CURRENT_PASSWORD'
    });
  }

  // Update password
  farmer.password = newPassword;
  await farmer.save();

  res.status(200).json({
    status: 'success',
    message: 'Password changed successfully'
  });
});

/**
 * @desc    Logout farmer (client-side token removal)
 * @route   POST /api/farmer/logout
 * @access  Private
 */
export const logoutFarmer = asyncHandler(async (req, res) => {
  // In a stateless JWT system, logout is handled client-side by removing the token
  // This endpoint can be used for logging purposes or token blacklisting if needed
  
  res.status(200).json({
    status: 'success',
    message: 'Logout successful. Please remove the token from client storage.'
  });
});

/**
 * @desc    Get farmer statistics
 * @route   GET /api/farmer/stats
 * @access  Private
 */
export const getFarmerStats = asyncHandler(async (req, res) => {
  const farmerId = req.farmerId;

  // Get basic farmer info
  const farmer = await Farmer.findById(farmerId);
  
  if (!farmer) {
    return res.status(404).json({
      status: 'error',
      message: 'Farmer not found',
      code: 'FARMER_NOT_FOUND'
    });
  }

  // Calculate account age
  const accountAge = Math.floor((Date.now() - farmer.createdAt.getTime()) / (1000 * 60 * 60 * 24));
  
  // Mock statistics (in real app, these would come from related collections)
  const stats = {
    accountAge: `${accountAge} days`,
    totalCropsListed: 0, // Would be calculated from crops collection
    totalOrders: 0, // Would be calculated from orders collection
    totalRevenue: 0, // Would be calculated from completed orders
    averageRating: 0, // Would be calculated from reviews
    profileCompleteness: calculateProfileCompleteness(farmer),
    lastLoginFormatted: farmer.lastLogin 
      ? farmer.lastLogin.toLocaleDateString('en-US', { 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        })
      : 'Never'
  };

  res.status(200).json({
    status: 'success',
    message: 'Farmer statistics retrieved successfully',
    data: {
      farmer: farmer.profile,
      stats
    }
  });
});

/**
 * Helper function to calculate profile completeness percentage
 */
const calculateProfileCompleteness = (farmer) => {
  const fields = [
    'name', 'email', 'farmLocation', 'farmSize', 
    'primaryCrops', 'phoneNumber', 'profilePicture'
  ];
  
  let completedFields = 0;
  
  fields.forEach(field => {
    if (farmer[field] && farmer[field] !== null && farmer[field] !== '') {
      if (Array.isArray(farmer[field]) && farmer[field].length > 0) {
        completedFields++;
      } else if (!Array.isArray(farmer[field])) {
        completedFields++;
      }
    }
  });
  
  return Math.round((completedFields / fields.length) * 100);
};

/**
 * @desc    Deactivate farmer account
 * @route   DELETE /api/farmer/account
 * @access  Private
 */
export const deactivateAccount = asyncHandler(async (req, res) => {
  const farmerId = req.farmerId;
  const { password } = req.body;

  // Get farmer with password for verification
  const farmer = await Farmer.findById(farmerId).select('+password');
  
  if (!farmer) {
    return res.status(404).json({
      status: 'error',
      message: 'Farmer not found',
      code: 'FARMER_NOT_FOUND'
    });
  }

  // Verify password before deactivation
  const isPasswordValid = await farmer.comparePassword(password);
  
  if (!isPasswordValid) {
    return res.status(400).json({
      status: 'error',
      message: 'Password is incorrect',
      code: 'INVALID_PASSWORD'
    });
  }

  // Deactivate account (soft delete)
  farmer.isActive = false;
  await farmer.save();

  res.status(200).json({
    status: 'success',
    message: 'Account deactivated successfully'
  });
});