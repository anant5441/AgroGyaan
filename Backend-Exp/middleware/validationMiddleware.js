import { body, validationResult } from 'express-validator';

/**
 * Validation Error Handler
 * Processes validation results and returns formatted errors
 */
export const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    const formattedErrors = errors.array().map(error => ({
      field: error.path || error.param,
      message: error.msg,
      value: error.value,
      location: error.location
    }));

    return res.status(400).json({
      status: 'error',
      message: 'Validation failed',
      code: 'VALIDATION_ERROR',
      errors: formattedErrors
    });
  }
  
  next();
};

/**
 * Farmer Profile Creation Validation Rules
 */
export const validateFarmerProfile = [
  body('farm_location.coordinates')
    .isArray({ min: 2, max: 2 })
    .withMessage('Coordinates must be an array with exactly 2 numbers [longitude, latitude]'),
  
  body('farm_location.coordinates.*')
    .isFloat()
    .withMessage('Coordinates must be valid numbers'),
    
  body('farm_location.type')
    .equals('Point')
    .withMessage('Location type must be "Point"'),
    
  body('soil_type')
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage('Soil type cannot exceed 50 characters'),
    
  body('farming_practices')
    .optional()
    .trim()
    .isLength({ max: 200 })
    .withMessage('Farming practices cannot exceed 200 characters'),
    
  body('experience_years')
    .optional()
    .isInt({ min: 0, max: 100 })
    .withMessage('Experience years must be between 0 and 100'),

  handleValidationErrors
];

/**
 * Farmer Profile Update Validation Rules
 */
export const validateFarmerUpdate = [
  body('farm_location.coordinates')
    .optional()
    .isArray({ min: 2, max: 2 })
    .withMessage('Coordinates must be an array with exactly 2 numbers [longitude, latitude]'),
  
  body('farm_location.coordinates.*')
    .optional()
    .isFloat()
    .withMessage('Coordinates must be valid numbers'),
    
  body('farm_location.type')
    .optional()
    .equals('Point')
    .withMessage('Location type must be "Point"'),
    
  body('soil_type')
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage('Soil type cannot exceed 50 characters'),
    
  body('farming_practices')
    .optional()
    .trim()
    .isLength({ max: 200 })
    .withMessage('Farming practices cannot exceed 200 characters'),
    
  body('experience_years')
    .optional()
    .isInt({ min: 0, max: 100 })
    .withMessage('Experience years must be between 0 and 100'),
    
  body('community_points')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Community points must be a positive integer'),

  handleValidationErrors
];

/**
 * Location Query Validation Rules
 */
export const validateLocationQuery = [
  body('longitude')
    .isFloat({ min: -180, max: 180 })
    .withMessage('Longitude must be a valid number between -180 and 180'),
    
  body('latitude')
    .isFloat({ min: -90, max: 90 })
    .withMessage('Latitude must be a valid number between -90 and 90'),
    
  body('maxDistance')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Max distance must be a positive number'),

  handleValidationErrors
];