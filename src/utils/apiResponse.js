/**
 * Standard API response format
 * @param {boolean} success - Indicates if the request was successful
 * @param {string} message - Message describing the result
 * @param {any} data - Data payload
 * @param {number} statusCode - HTTP status code
 * @returns {Object} Formatted response object
 */
const formatResponse = (success, message, data = null, statusCode = 200) => {
  return {
    success,
    message,
    data,
    statusCode,
  };
};

/**
 * Success response
 * @param {string} message - Success message
 * @param {any} data - Data payload
 * @param {number} statusCode - HTTP status code (default: 200)
 */
const success = (message, data = null, statusCode = 200) => {
  return formatResponse(true, message, data, statusCode);
};

/**
 * Error response
 * @param {string} message - Error message
 * @param {number} statusCode - HTTP status code (default: 400)
 * @param {any} data - Additional error details
 */
const error = (message, statusCode = 400, data = null) => {
  return formatResponse(false, message, data, statusCode);
};

module.exports = {
  formatResponse,
  success,
  error,
};
