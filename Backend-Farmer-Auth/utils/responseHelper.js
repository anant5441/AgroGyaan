/**
 * Response Helper Utilities
 * Standardized response formats for consistent API responses
 */

/**
 * Success Response Helper
 * @param {Object} res - Express response object
 * @param {number} statusCode - HTTP status code
 * @param {string} message - Success message
 * @param {Object} data - Response data
 * @param {Object} meta - Additional metadata
 */
export const sendSuccess = (res, statusCode = 200, message = 'Success', data = null, meta = null) => {
  const response = {
    status: 'success',
    message,
    timestamp: new Date().toISOString()
  };

  if (data !== null) {
    response.data = data;
  }

  if (meta !== null) {
    response.meta = meta;
  }

  return res.status(statusCode).json(response);
};

/**
 * Error Response Helper
 * @param {Object} res - Express response object
 * @param {number} statusCode - HTTP status code
 * @param {string} message - Error message
 * @param {string} code - Error code
 * @param {Object} details - Additional error details
 */
export const sendError = (res, statusCode = 500, message = 'Internal server error', code = 'INTERNAL_ERROR', details = null) => {
  const response = {
    status: 'error',
    message,
    code,
    timestamp: new Date().toISOString()
  };

  if (details !== null) {
    response.details = details;
  }

  // Add stack trace in development
  if (process.env.NODE_ENV === 'development' && details && details.stack) {
    response.stack = details.stack;
  }

  return res.status(statusCode).json(response);
};

/**
 * Validation Error Response Helper
 * @param {Object} res - Express response object
 * @param {Array} errors - Array of validation errors
 */
export const sendValidationError = (res, errors) => {
  return res.status(400).json({
    status: 'error',
    message: 'Validation failed',
    code: 'VALIDATION_ERROR',
    errors,
    timestamp: new Date().toISOString()
  });
};

/**
 * Pagination Response Helper
 * @param {Object} res - Express response object
 * @param {Array} data - Array of data items
 * @param {number} page - Current page number
 * @param {number} limit - Items per page
 * @param {number} total - Total number of items
 * @param {string} message - Success message
 */
export const sendPaginatedResponse = (res, data, page, limit, total, message = 'Data retrieved successfully') => {
  const totalPages = Math.ceil(total / limit);
  
  return res.status(200).json({
    status: 'success',
    message,
    data,
    pagination: {
      currentPage: page,
      totalPages,
      totalItems: total,
      itemsPerPage: limit,
      hasNext: page < totalPages,
      hasPrev: page > 1,
      nextPage: page < totalPages ? page + 1 : null,
      prevPage: page > 1 ? page - 1 : null
    },
    timestamp: new Date().toISOString()
  });
};

/**
 * Authentication Response Helper
 * @param {Object} res - Express response object
 * @param {Object} farmer - Farmer object
 * @param {string} token - JWT token
 * @param {string} message - Success message
 */
export const sendAuthResponse = (res, farmer, token, message = 'Authentication successful') => {
  return res.status(200).json({
    status: 'success',
    message,
    data: {
      farmer: farmer.profile,
      token,
      expiresIn: process.env.JWT_EXPIRES_IN || '1h',
      tokenType: 'Bearer'
    },
    timestamp: new Date().toISOString()
  });
};

/**
 * No Content Response Helper
 * @param {Object} res - Express response object
 * @param {string} message - Success message
 */
export const sendNoContent = (res, message = 'Operation completed successfully') => {
  return res.status(204).json({
    status: 'success',
    message,
    timestamp: new Date().toISOString()
  });
};