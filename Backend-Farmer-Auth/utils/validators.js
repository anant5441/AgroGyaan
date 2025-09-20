/**
 * Custom Validation Utilities
 * Additional validation functions for specific use cases
 */

/**
 * Validate Indian phone number
 * @param {string} phoneNumber - Phone number to validate
 * @returns {boolean} - True if valid
 */
export const isValidIndianPhone = (phoneNumber) => {
  // Remove all non-digit characters
  const cleaned = phoneNumber.replace(/\D/g, '');
  
  // Check for Indian mobile number patterns
  const patterns = [
    /^[6-9]\d{9}$/, // 10 digit mobile number starting with 6-9
    /^91[6-9]\d{9}$/, // With country code 91
    /^0[6-9]\d{9}$/ // With leading 0
  ];
  
  return patterns.some(pattern => pattern.test(cleaned));
};

/**
 * Validate password strength
 * @param {string} password - Password to validate
 * @returns {Object} - Validation result with score and feedback
 */
export const validatePasswordStrength = (password) => {
  const result = {
    isValid: false,
    score: 0,
    feedback: []
  };

  if (!password) {
    result.feedback.push('Password is required');
    return result;
  }

  // Length check
  if (password.length < 6) {
    result.feedback.push('Password must be at least 6 characters long');
  } else if (password.length >= 8) {
    result.score += 1;
  }

  // Lowercase check
  if (!/[a-z]/.test(password)) {
    result.feedback.push('Password must contain at least one lowercase letter');
  } else {
    result.score += 1;
  }

  // Uppercase check
  if (!/[A-Z]/.test(password)) {
    result.feedback.push('Password must contain at least one uppercase letter');
  } else {
    result.score += 1;
  }

  // Number check
  if (!/\d/.test(password)) {
    result.feedback.push('Password must contain at least one number');
  } else {
    result.score += 1;
  }

  // Special character check (optional but recommended)
  if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    result.score += 1;
  }

  // Common password check
  const commonPasswords = [
    'password', '123456', '123456789', 'qwerty', 'abc123', 
    'password123', 'admin', 'letmein', 'welcome', 'monkey'
  ];
  
  if (commonPasswords.includes(password.toLowerCase())) {
    result.feedback.push('Password is too common. Please choose a more unique password');
    result.score = Math.max(0, result.score - 2);
  }

  result.isValid = result.feedback.length === 0 && result.score >= 3;
  
  return result;
};

/**
 * Validate email format
 * @param {string} email - Email to validate
 * @returns {boolean} - True if valid
 */
export const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validate farmer name
 * @param {string} name - Name to validate
 * @returns {Object} - Validation result
 */
export const validateFarmerName = (name) => {
  const result = {
    isValid: false,
    errors: []
  };

  if (!name || typeof name !== 'string') {
    result.errors.push('Name is required');
    return result;
  }

  const trimmedName = name.trim();

  if (trimmedName.length < 2) {
    result.errors.push('Name must be at least 2 characters long');
  }

  if (trimmedName.length > 50) {
    result.errors.push('Name cannot exceed 50 characters');
  }

  if (!/^[a-zA-Z\s]+$/.test(trimmedName)) {
    result.errors.push('Name can only contain letters and spaces');
  }

  result.isValid = result.errors.length === 0;
  return result;
};

/**
 * Validate farm size
 * @param {number} farmSize - Farm size to validate
 * @returns {Object} - Validation result
 */
export const validateFarmSize = (farmSize) => {
  const result = {
    isValid: false,
    errors: []
  };

  if (farmSize === undefined || farmSize === null) {
    result.isValid = true; // Farm size is optional
    return result;
  }

  if (typeof farmSize !== 'number' || isNaN(farmSize)) {
    result.errors.push('Farm size must be a valid number');
    return result;
  }

  if (farmSize < 0) {
    result.errors.push('Farm size cannot be negative');
  }

  if (farmSize > 10000) {
    result.errors.push('Farm size seems unusually large. Please verify.');
  }

  result.isValid = result.errors.length === 0;
  return result;
};

/**
 * Sanitize input string
 * @param {string} input - Input to sanitize
 * @returns {string} - Sanitized input
 */
export const sanitizeInput = (input) => {
  if (typeof input !== 'string') return input;
  
  return input
    .trim()
    .replace(/[<>]/g, '') // Remove potential HTML tags
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+=/gi, ''); // Remove event handlers
};

/**
 * Validate crop names array
 * @param {Array} crops - Array of crop names
 * @returns {Object} - Validation result
 */
export const validateCrops = (crops) => {
  const result = {
    isValid: false,
    errors: []
  };

  if (!crops) {
    result.isValid = true; // Crops are optional
    return result;
  }

  if (!Array.isArray(crops)) {
    result.errors.push('Crops must be an array');
    return result;
  }

  if (crops.length > 20) {
    result.errors.push('Cannot specify more than 20 primary crops');
  }

  const validCrops = crops.filter(crop => {
    return typeof crop === 'string' && 
           crop.trim().length > 0 && 
           crop.trim().length <= 50 &&
           /^[a-zA-Z\s]+$/.test(crop.trim());
  });

  if (validCrops.length !== crops.length) {
    result.errors.push('All crop names must be valid strings (letters and spaces only, 1-50 characters)');
  }

  result.isValid = result.errors.length === 0;
  return result;
};