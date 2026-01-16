import jwt from "jsonwebtoken";
import User from "../models/User.js";

export const protect = async (req, res, next) => {
  try {
    let token;

    console.log('🔍 Auth Header:', req.headers.authorization);

    if (req.headers.authorization &&
      (req.headers.authorization.startsWith('Bearer') || req.headers.authorization.startsWith('bearer'))) {
      token = req.headers.authorization.split(' ')[1];
      console.log('✅ Token extracted:', token.substring(0, 20) + '...');
    }

    if (!token) {
      console.log('❌ No token found');
      return res.status(401).json({
        success: false,
        message: 'Not authorized to access this route'
      });
    }

    try {
      console.log('🔑 JWT_SECRET:', process.env.JWT_SECRET);
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      console.log('✅ Token decoded:', decoded);
      req.user = await User.findById(decoded.id);
      console.log('✅ User found:', req.user ? req.user.email : 'NOT FOUND');
      next();
    } catch (error) {
      console.log('❌ Token verification failed:', error.message);
      return res.status(401).json({
        success: false,
        message: 'Not authorized to access this route'
      });
    }
  } catch (error) {
    console.log('❌ Server error:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Server Error'
    });
  }
};

export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `User role ${req.user.role} is not authorized to access this route`
      });
    }
    next();
  };
};