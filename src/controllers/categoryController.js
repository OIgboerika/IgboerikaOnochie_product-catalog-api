const Category = require("../models/Category");
const { APIError } = require("../middleware/errorHandler");
const apiResponse = require("../utils/apiResponse");

/**
 * Get all categories
 * @route GET /api/v1/categories
 * @access Public
 */
const getCategories = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 10,
      sort = "name",
      order = "asc",
      active,
      parent,
    } = req.query;

    // Build query
    const query = {};

    // Filter by active status if provided
    if (active !== undefined) {
      query.active = active === "true";
    }

    // Filter by parent category
    if (parent !== undefined) {
      query.parentCategory = parent === "null" ? null : parent;
    }

    // Calculate pagination
    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skip = (pageNum - 1) * limitNum;

    // Build sort
    const sortOption = {};
    sortOption[sort] = order === "desc" ? -1 : 1;

    // Execute query
    const categories = await Category.find(query)
      .populate("parentCategory", "name slug")
      .sort(sortOption)
      .skip(skip)
      .limit(limitNum);

    // Get total count
    const total = await Category.countDocuments(query);

    // Return response
    return res.status(200).json(
      apiResponse.success("Categories retrieved successfully", {
        categories,
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
 * Get a single category
 * @route GET /api/v1/categories/:id
 * @access Public
 */
const getCategory = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Check if ID is provided
    if (!id) {
      throw new APIError("Category ID is required", 400);
    }

    // Find category by ID or slug
    const query = id.match(/^[0-9a-fA-F]{24}$/) ? { _id: id } : { slug: id };

    const category = await Category.findOne(query)
      .populate("parentCategory", "name slug")
      .populate("subcategories", "name slug");

    // Check if category exists
    if (!category) {
      throw new APIError(`Category not found with ID: ${id}`, 404);
    }

    // Return response
    return res
      .status(200)
      .json(
        apiResponse.success("Category retrieved successfully", { category })
      );
  } catch (error) {
    next(error);
  }
};

/**
 * Create a new category
 * @route POST /api/v1/categories
 * @access Private
 */
const createCategory = async (req, res, next) => {
  try {
    const { name, description, parentCategory, active } = req.body;

    // Create category
    const category = await Category.create({
      name,
      description,
      parentCategory: parentCategory || null,
      active: active !== undefined ? active : true,
    });

    // Return response
    return res
      .status(201)
      .json(
        apiResponse.success("Category created successfully", { category }, 201)
      );
  } catch (error) {
    next(error);
  }
};

/**
 * Update a category
 * @route PUT /api/v1/categories/:id
 * @access Private
 */
const updateCategory = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Check if category exists
    const category = await Category.findById(id);
    if (!category) {
      throw new APIError(`Category not found with ID: ${id}`, 404);
    }

    // Prevent circular parent reference
    if (req.body.parentCategory && req.body.parentCategory === id) {
      throw new APIError("Category cannot be its own parent", 400);
    }

    // Update category
    const updatedCategory = await Category.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true,
    }).populate("parentCategory", "name slug");

    // Return response
    return res
      .status(200)
      .json(
        apiResponse.success("Category updated successfully", {
          category: updatedCategory,
        })
      );
  } catch (error) {
    next(error);
  }
};

/**
 * Delete a category
 * @route DELETE /api/v1/categories/:id
 * @access Private
 */
const deleteCategory = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Check if category exists
    const category = await Category.findById(id);
    if (!category) {
      throw new APIError(`Category not found with ID: ${id}`, 404);
    }

    // Check if category has subcategories
    const subcategories = await Category.countDocuments({ parentCategory: id });
    if (subcategories > 0) {
      throw new APIError("Cannot delete category with subcategories", 400);
    }

    // Delete category
    await category.deleteOne();

    // Return response
    return res
      .status(200)
      .json(apiResponse.success("Category deleted successfully", null));
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getCategories,
  getCategory,
  createCategory,
  updateCategory,
  deleteCategory,
};
