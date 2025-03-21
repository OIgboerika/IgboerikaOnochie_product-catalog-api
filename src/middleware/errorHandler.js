const apiResponse = require("../utils/apiResponse");
const logger = require("../utils/logger");

// Custom error class for API errors
class APIError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}

// Global error handler middleware
const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;

  // Log error
  logger.error(
    `${error.statusCode || 500} - ${error.message} - ${req.originalUrl} - ${
      req.method
    }`
  );

  // Mongoose validation error
  if (err.name === "ValidationError") {
    const message = Object.values(err.errors)
      .map((val) => val.message)
      .join(", ");
    error = new APIError(message, 400);
  }

  // Mongoose duplicate key error
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    const message = `Duplicate value entered for ${field}`;
    error = new APIError(message, 400);
  }

  // Mongoose cast error (invalid ID)
  if (err.name === "CastError") {
    const message = `Resource not found with ID: ${err.value}`;
    error = new APIError(message, 404);
  }

  // Return formatted error response
  return res
    .status(error.statusCode || 500)
    .json(
      apiResponse.error(
        error.message || "Server Error",
        error.statusCode || 500
      )
    );
};

module.exports = {
  APIError,
  errorHandler,
};
