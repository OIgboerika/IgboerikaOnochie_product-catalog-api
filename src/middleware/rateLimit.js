const rateLimit = require("express-rate-limit");
const config = require("../config");

// Create rate limiter middleware
const apiRateLimiter = rateLimit({
  windowMs: config.rateLimit.windowMs,
  max: config.rateLimit.max,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many requests, please try again later",
    data: null,
    statusCode: 429,
  },
});

module.exports = apiRateLimiter;
