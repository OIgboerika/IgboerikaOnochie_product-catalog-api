const { APIError } = require("./errorHandler");

/**
 * Input validation middleware factory
 * @param {Function} validationFn - Validation function that returns [isValid, errors]
 * @returns {Function} Express middleware
 */
const validate = (validationFn) => {
  return (req, res, next) => {
    try {
      const [isValid, errors] = validationFn(req);

      if (!isValid) {
        throw new APIError(
          errors.length > 0
            ? `Validation failed: ${errors.join(", ")}`
            : "Validation failed",
          400
        );
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};

module.exports = validate;
