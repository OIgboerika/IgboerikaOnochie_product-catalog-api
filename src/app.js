const express = require("express");
const config = require("./config");
const errorHandler = require("./middleware/errorHandler");
const rateLimit = require("./middleware/rateLimit");
const validate = require("./middleware/validate");

// Import routes
const productRoutes = require("./routes/productRoutes");
const categoryRoutes = require("./routes/categoryRoutes");
const searchRoutes = require("./routes/searchRoutes");
const inventoryRoutes = require("./routes/inventoryRoutes");
const reportRoutes = require("./routes/reportRoutes");

const app = express();

// Middleware
app.use(express.json());
app.use(rateLimit);

// Routes
app.use("/api/products", productRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/search", searchRoutes);
app.use("/api/inventory", inventoryRoutes);
app.use("/api/reports", reportRoutes);

// Error handling
app.use(errorHandler);

module.exports = app;
