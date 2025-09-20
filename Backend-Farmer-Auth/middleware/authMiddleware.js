import jwt from 'jsonwebtoken';
import Farmer from '../models/Farmer.js';

/**
 * JWT Authentication Middleware
 * Verifies JWT token and attaches farmer data to request object
 */
export const authenticateToken = async (req, res, next) => {
  try {
    // Get token from header
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.startsWith('Bearer ') 
      ? authHeader.substring(7) 
      : null;

    if (!token) {
      return res.status(401).json({
        status: 'error',
        message: 'Access denied. No token provided.',
        code: 'NO_TOKEN'
      });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Find farmer and check if still active
    const farmer = await Farmer.findById(decoded.farmerId);
    
    if (!farmer) {
      return res.status(401).json({
        status: 'error',
        message: 'Invalid token. Farmer not found.',
        code: 'FARMER_NOT_FOUND'
      });
    }

    if (!farmer.isActive) {
      return res.status(401).json({
        status: 'error',
        message: 'Account has been deactivated.',
        code: 'ACCOUNT_DEACTIVATED'
      });
    }

    // Attach farmer data to request
    req.farmer = farmer;
    req.farmerId = farmer._id;
    
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        status: 'error',
        message: 'Invalid token format.',
        code: 'INVALID_TOKEN'
      });
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        status: 'error',
        message: 'Token has expired. Please login again.',
        code: 'TOKEN_EXPIRED'
      });
    }

    console.error('Auth middleware error:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Authentication failed due to server error.',
      code: 'AUTH_SERVER_ERROR'
    });
  }
};

/**
 * Optional Authentication Middleware
 * Attaches farmer data if token is valid, but doesn't block request if no token
 */
export const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.startsWith('Bearer ') 
      ? authHeader.substring(7) 
      : null;

    if (!token) {
      return next();
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const farmer = await Farmer.findById(decoded.farmerId);
    
    if (farmer && farmer.isActive) {
      req.farmer = farmer;
      req.farmerId = farmer._id;
    }
    
    next();
  } catch (error) {
    // For optional auth, we don't return errors, just continue without auth
    next();
  }
};

/**
 * Role-based Authorization Middleware
 * Checks if authenticated farmer has required role
 */
export const requireRole = (roles) => {
  return (req, res, next) => {
    if (!req.farmer) {
      return res.status(401).json({
        status: 'error',
        message: 'Authentication required.',
        code: 'AUTH_REQUIRED'
      });
    }

    const allowedRoles = Array.isArray(roles) ? roles : [roles];
    
    if (!allowedRoles.includes(req.farmer.role)) {
      return res.status(403).json({
        status: 'error',
        message: 'Insufficient permissions.',
        code: 'INSUFFICIENT_PERMISSIONS',
        requiredRoles: allowedRoles,
        userRole: req.farmer.role
      });
    }

    next();
  };
};

/**
 * Generate JWT Token
 * Creates a signed JWT token with farmer ID and role
 */
export const generateToken = (farmerId, role = 'farmer') => {
  try {
    return jwt.sign(
      { 
        farmerId, 
        role,
        iat: Math.floor(Date.now() / 1000),
        type: 'access'
      },
      process.env.JWT_SECRET,
      { 
        expiresIn: process.env.JWT_EXPIRES_IN || '1h',
        issuer: 'agrogyaan-auth',
        audience: 'agrogyaan-farmers'
      }
    );
  } catch (error) {
    throw new Error('Token generation failed');
  }
};

/**
 * Verify JWT Token
 * Utility function to verify token without middleware
 */
export const verifyToken = (token) => {
  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch (error) {
    throw error;
  }
};