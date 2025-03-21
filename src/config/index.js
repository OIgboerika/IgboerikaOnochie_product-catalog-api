const dotenv = require("dotenv");

// Load environment variables
dotenv.config();

module.exports = {
  // Server configuration
  port: process.env.PORT || 3000,
  nodeEnv: process.env.NODE_ENV || "development",

  // Database configuration
  mongoUri:
    process.env.MONGO_URI || "mongodb://localhost:27017/product-catalog",

  // JWT configuration (for authentication extension)
  jwtSecret: process.env.JWT_SECRET,
  jwtExpire: process.env.JWT_EXPIRE || "30d",

  // Rate limiting (for rate limiting extension)
  rateLimit: {
    windowMs: process.env.RATE_LIMIT_WINDOW || 15 * 60 * 1000, // 15 minutes in milliseconds
    max: process.env.RATE_LIMIT_MAX || 100, // Limit each IP to 100 requests per windowMs
  },
};
