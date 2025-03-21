const Product = require("../models/Product");
const { APIError } = require("../middleware/errorHandler");
const apiResponse = require("../utils/apiResponse");

/**
 * Get all products
 * @route GET /api/v1/products
 * @access Public
 */
const getProducts = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 10,
      sort = "createdAt",
      order = "desc",
      category,
      featured,
      minPrice,
      maxPrice,
      active,
    } = req.query;

    // Build query
    const query = {};

    // Filter by category if provided
    if (category) {
      query.categories = category;
    }

    // Filter by featured status if provided
    if (featured !== undefined) {
      query.featured = featured === "true";
    }

    // Filter by active status if provided
    if (active !== undefined) {
      query.active = active === "true";
    }

    // Filter by price range if provided
    if (minPrice !== undefined || maxPrice !== undefined) {
      query.basePrice = {};
      if (minPrice !== undefined) {
        query.basePrice.$gte = Number(minPrice);
      }
      if (maxPrice !== undefined) {
        query.basePrice.$lte = Number(maxPrice);
      }
    }

    // Calculate pagination
    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skip = (pageNum - 1) * limitNum;

    // Build sort
    const sortOption = {};
    sortOption[sort] = order === "desc" ? -1 : 1;

    // Execute query
    const products = await Product.find(query)
      .populate("categories", "name slug")
      .sort(sortOption)
      .skip(skip)
      .limit(limitNum);

    // Get total count
    const total = await Product.countDocuments(query);

    // Return response
    return res.status(200).json(
      apiResponse.success("Products retrieved successfully", {
        products,
        pagination: {
          total,
          page: pageNum,
          limit: limitNum,
          pages: Math.ceil(total / limitNum),
        },
      })
    );
  } catch (error) {
    next(error);
  }
};

/**
 * Get a single product
 * @route GET /api/v1/products/:id
 * @access Public
 */
const getProduct = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Check if ID is provided
    if (!id) {
      throw new APIError("Product ID is required", 400);
    }

    // Find product by ID or slug
    const query = id.match(/^[0-9a-fA-F]{24}$/) ? { _id: id } : { slug: id };

    const product = await Product.findOne(query)
      .populate("categories", "name slug")
      .populate({
        path: "variants",
        populate: {
          path: "inventory",
        },
      });

    // Check if product exists
    if (!product) {
      throw new APIError(`Product not found with ID: ${id}`, 404);
    }

    // Return response
    return res
      .status(200)
      .json(apiResponse.success("Product retrieved successfully", { product }));
  } catch (error) {
    next(error);
  }
};

/**
 * Create a new product
 * @route POST /api/v1/products
 * @access Private
 */
const createProduct = async (req, res, next) => {
  try {
    const {
      name,
      description,
      sku,
      basePrice,
      discountPercent,
      categories,
      tags,
      attributes,
      active,
      featured,
      images,
    } = req.body;

    // Create product
    const product = await Product.create({
      name,
      description,
      sku,
      basePrice,
      discountPercent,
      categories,
      tags,
      attributes: attributes || {},
      active: active !== undefined ? active : true,
      featured: featured !== undefined ? featured : false,
      images: images || [],
    });

    // Return response
    return res
      .status(201)
      .json(
        apiResponse.success("Product created successfully", { product }, 201)
      );
  } catch (error) {
    next(error);
  }
};

/**
 * Update a product
 * @route PUT /api/v1/products/:id
 * @access Private
 */
const updateProduct = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Check if product exists
    const product = await Product.findById(id);
    if (!product) {
      throw new APIError(`Product not found with ID: ${id}`, 404);
    }

    // Update product
    const updatedProduct = await Product.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true,
    }).populate("categories", "name slug");

    // Return response
    return res
      .status(200)
      .json(
        apiResponse.success("Product updated successfully", {
          product: updatedProduct,
        })
      );
  } catch (error) {
    next(error);
  }
};

/**
 * Delete a product
 * @route DELETE /api/v1/products/:id
 * @access Private
 */
const deleteProduct = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Check if product exists
    const product = await Product.findById(id);
    if (!product) {
      throw new APIError(`Product not found with ID: ${id}`, 404);
    }

    // Delete product
    await product.deleteOne();

    // Return response
    return res
      .status(200)
      .json(apiResponse.success("Product deleted successfully", null));
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
};
