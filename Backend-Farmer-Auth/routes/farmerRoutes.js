import express from 'express';
import {
  registerFarmer,
  loginFarmer,
  getFarmerProfile,
  updateFarmerProfile,
  changePassword,
  logoutFarmer,
  getFarmerStats,
  deactivateAccount
} from '../controllers/farmerController.js';
import { 
  authenticateToken, 
  optionalAuth, 
  requireRole 
} from '../middleware/authMiddleware.js';
import {
  validateFarmerRegistration,
  validateFarmerLogin,
  validateProfileUpdate,
  validatePasswordChange
} from '../middleware/validationMiddleware.js';

const router = express.Router();

// Public routes
/**
 * @route   POST /api/farmer/register
 * @desc    Register a new farmer
 * @access  Public
 */
router.post('/register', validateFarmerRegistration, registerFarmer);

/**
 * @route   POST /api/farmer/login
 * @desc    Login farmer and get JWT token
 * @access  Public
 */
router.post('/login', validateFarmerLogin, loginFarmer);

// Protected routes (require authentication)
/**
 * @route   GET /api/farmer/profile
 * @desc    Get current farmer's profile
 * @access  Private
 */
router.get('/profile', authenticateToken, getFarmerProfile);

/**
 * @route   PUT /api/farmer/profile
 * @desc    Update farmer profile
 * @access  Private
 */
router.put('/profile', authenticateToken, validateProfileUpdate, updateFarmerProfile);

/**
 * @route   GET /api/farmer/stats
 * @desc    Get farmer statistics and dashboard data
 * @access  Private
 */
router.get('/stats', authenticateToken, getFarmerStats);

/**
 * @route   PUT /api/farmer/change-password
 * @desc    Change farmer password
 * @access  Private
 */
router.put('/change-password', authenticateToken, validatePasswordChange, changePassword);

/**
 * @route   POST /api/farmer/logout
 * @desc    Logout farmer (client-side token removal)
 * @access  Private
 */
router.post('/logout', authenticateToken, logoutFarmer);

/**
 * @route   DELETE /api/farmer/account
 * @desc    Deactivate farmer account
 * @access  Private
 */
router.delete('/account', authenticateToken, deactivateAccount);

// Admin-only routes
/**
 * @route   GET /api/farmer/all
 * @desc    Get all farmers (admin only)
 * @access  Private/Admin
 */
router.get('/all', authenticateToken, requireRole(['admin']), async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const farmers = await Farmer.find({ isActive: true })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Farmer.countDocuments({ isActive: true });

    res.status(200).json({
      status: 'success',
      message: 'Farmers retrieved successfully',
      data: {
        farmers,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(total / limit),
          totalFarmers: total,
          hasNext: page < Math.ceil(total / limit),
          hasPrev: page > 1
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Failed to retrieve farmers',
      code: 'FETCH_ERROR'
    });
  }
});

// Test route for checking authentication
/**
 * @route   GET /api/farmer/test-auth
 * @desc    Test authentication middleware
 * @access  Private
 */
router.get('/test-auth', authenticateToken, (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'Authentication successful',
    data: {
      farmerId: req.farmerId,
      farmerName: req.farmer.name,
      timestamp: new Date().toISOString()
    }
  });
});

export default router;