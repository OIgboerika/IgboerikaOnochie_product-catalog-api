/**
 * Validates if input is a valid non-empty string
 * @param {string} input - Input to validate
 * @returns {boolean} - True if valid string
 */
const isValidString = (input) => {
  return typeof input === "string" && input.trim().length > 0;
};

/**
 * Validates if input is a valid positive number
 * @param {number} input - Input to validate
 * @returns {boolean} - True if valid positive number
 */
const isValidNumber = (input) => {
  return !isNaN(Number(input)) && Number(input) >= 0;
};

/**
 * Validates if input is a valid array with minimum length
 * @param {Array} input - Array to validate
 * @param {number} minLength - Minimum required length
 * @returns {boolean} - True if valid array
 */
const isValidArray = (input, minLength = 0) => {
  return Array.isArray(input) && input.length >= minLength;
};

/**
 * Validates if input is a valid object
 * @param {Object} input - Object to validate
 * @returns {boolean} - True if valid object
 */
const isValidObject = (input) => {
  return typeof input === "object" && input !== null && !Array.isArray(input);
};

/**
 * Validates if input is a valid date
 * @param {string|Date} input - Date to validate
 * @returns {boolean} - True if valid date
 */
const isValidDate = (input) => {
  const date = new Date(input);
  return !isNaN(date.getTime());
};

module.exports = {
  isValidString,
  isValidNumber,
  isValidArray,
  isValidObject,
  isValidDate,
};
