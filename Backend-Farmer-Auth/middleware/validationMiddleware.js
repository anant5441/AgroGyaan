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
 * Farmer Registration Validation Rules
 */
export const validateFarmerRegistration = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Name must be between 2 and 50 characters')
    .matches(/^[a-zA-Z\s]+$/)
    .withMessage('Name can only contain letters and spaces'),
    
  body('email')
    .trim()
    .isEmail()
    .withMessage('Please provide a valid email address')
    .normalizeEmail()
    .isLength({ max: 100 })
    .withMessage('Email cannot exceed 100 characters'),
    
  body('password')
    .isLength({ min: 6, max: 128 })
    .withMessage('Password must be between 6 and 128 characters')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain at least one lowercase letter, one uppercase letter, and one number'),
    
  body('confirmPassword')
    .custom((value, { req }) => {
      if (value !== req.body.password) {
        throw new Error('Password confirmation does not match password');
      }
      return true;
    }),
    
  // Optional fields validation
  body('farmLocation')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Farm location cannot exceed 100 characters'),
    
  body('farmSize')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Farm size must be a positive number'),
    
  body('primaryCrops')
    .optional()
    .isArray()
    .withMessage('Primary crops must be an array'),
    
  body('primaryCrops.*')
    .optional()
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('Each crop name must be between 1 and 50 characters'),
    
  body('phoneNumber')
    .optional()
    .trim()
    .matches(/^[+]?[\d\s-()]+$/)
    .withMessage('Please provide a valid phone number')
    .isLength({ min: 10, max: 15 })
    .withMessage('Phone number must be between 10 and 15 digits'),

  handleValidationErrors
];

/**
 * Farmer Login Validation Rules
 */
export const validateFarmerLogin = [
  body('email')
    .trim()
    .isEmail()
    .withMessage('Please provide a valid email address')
    .normalizeEmail(),
    
  body('password')
    .notEmpty()
    .withMessage('Password is required')
    .isLength({ min: 1 })
    .withMessage('Password cannot be empty'),

  handleValidationErrors
];

/**
 * Profile Update Validation Rules
 */
export const validateProfileUpdate = [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Name must be between 2 and 50 characters')
    .matches(/^[a-zA-Z\s]+$/)
    .withMessage('Name can only contain letters and spaces'),
    
  body('farmLocation')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Farm location cannot exceed 100 characters'),
    
  body('farmSize')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Farm size must be a positive number'),
    
  body('primaryCrops')
    .optional()
    .isArray()
    .withMessage('Primary crops must be an array'),
    
  body('primaryCrops.*')
    .optional()
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('Each crop name must be between 1 and 50 characters'),
    
  body('phoneNumber')
    .optional()
    .trim()
    .matches(/^[+]?[\d\s-()]+$/)
    .withMessage('Please provide a valid phone number')
    .isLength({ min: 10, max: 15 })
    .withMessage('Phone number must be between 10 and 15 digits'),

  handleValidationErrors
];

/**
 * Password Change Validation Rules
 */
export const validatePasswordChange = [
  body('currentPassword')
    .notEmpty()
    .withMessage('Current password is required'),
    
  body('newPassword')
    .isLength({ min: 6, max: 128 })
    .withMessage('New password must be between 6 and 128 characters')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('New password must contain at least one lowercase letter, one uppercase letter, and one number'),
    
  body('confirmNewPassword')
    .custom((value, { req }) => {
      if (value !== req.body.newPassword) {
        throw new Error('New password confirmation does not match new password');
      }
      return true;
    }),

  handleValidationErrors
];