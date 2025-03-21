const Variant = require("../models/Variant");
const Product = require("../models/Product");
const Inventory = require("../models/Inventory");
const { APIError } = require("../middleware/errorHandler");
const apiResponse = require("../utils/apiResponse");

/**
 * Get all variants for a product
 * @route GET /api/v1/products/:productId/variants
 * @access Public
 */
const getVariants = async (req, res, next) => {
  try {
    const { productId } = req.params;

    // Check if product exists
    const product = await Product.findById(productId);
    if (!product) {
      throw new APIError(`Product not found with ID: ${productId}`, 404);
    }

    // Get variants
    const variants = await Variant.find({ product: productId }).populate(
      "inventory"
    );

    // Return response
    return res
      .status(200)
      .json(
        apiResponse.success("Variants retrieved successfully", { variants })
      );
  } catch (error) {
    next(error);
  }
};

/**
 * Get a single variant
 * @route GET /api/v1/variants/:id
 * @access Public
 */
const getVariant = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Find variant
    const variant = await Variant.findById(id)
      .populate("product", "name sku basePrice")
      .populate("inventory");

    // Check if variant exists
    if (!variant) {
      throw new APIError(`Variant not found with ID: ${id}`, 404);
    }

    // Return response
    return res
      .status(200)
      .json(apiResponse.success("Variant retrieved successfully", { variant }));
  } catch (error) {
    next(error);
  }
};

/**
 * Create a new variant
 * @route POST /api/v1/products/:productId/variants
 * @access Private
 */
const createVariant = async (req, res, next) => {
  try {
    const { productId } = req.params;
    const {
      sku,
      name,
      attributes,
      priceDifference,
      active,
      images,
      initialInventory,
    } = req.body;

    // Check if product exists
    const product = await Product.findById(productId);
    if (!product) {
      throw new APIError(`Product not found with ID: ${productId}`, 404);
    }

    // Create variant
    const variant = await Variant.create({
      product: productId,
      sku,
      name,
      attributes,
      priceDifference: priceDifference || 0,
      active: active !== undefined ? active : true,
      images: images || [],
    });

    // Create inventory if initial inventory data provided
    if (initialInventory) {
      await Inventory.create({
        variant: variant._id,
        quantity: initialInventory.quantity || 0,
        reserved: initialInventory.reserved || 0,
        lowStockThreshold: initialInventory.lowStockThreshold || 5,
        reorderPoint: initialInventory.reorderPoint || 10,
        reorderQuantity: initialInventory.reorderQuantity || 20,
        warehouseLocation:
          initialInventory.warehouseLocation || "Main Warehouse",
      });
    }

    // Return response with populated variant
    const populatedVariant = await Variant.findById(variant._id)
      .populate("product", "name sku basePrice")
      .populate("inventory");

    return res
      .status(201)
      .json(
        apiResponse.success(
          "Variant created successfully",
          { variant: populatedVariant },
          201
        )
      );
  } catch (error) {
    next(error);
  }
};

/**
 * Update a variant
 * @route PUT /api/v1/variants/:id
 * @access Private
 */
const updateVariant = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Check if variant exists
    const variant = await Variant.findById(id);
    if (!variant) {
      throw new APIError(`Variant not found with ID: ${id}`, 404);
    }

    // Update variant
    const updatedVariant = await Variant.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true,
    })
      .populate("product", "name sku basePrice")
      .populate("inventory");

    // Return response
    return res
      .status(200)
      .json(
        apiResponse.success("Variant updated successfully", {
          variant: updatedVariant,
        })
      );
  } catch (error) {
    next(error);
  }
};

/**
 * Delete a variant
 * @route DELETE /api/v1/variants/:id
 * @access Private
 */
const deleteVariant = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Check if variant exists
    const variant = await Variant.findById(id);
    if (!variant) {
      throw new APIError(`Variant not found with ID: ${id}`, 404);
    }

    // Delete associated inventory
    await Inventory.deleteOne({ variant: id });

    // Delete variant
    await variant.deleteOne();

    // Return response
    return res
      .status(200)
      .json(apiResponse.success("Variant deleted successfully", null));
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getVariants,
  getVariant,
  createVariant,
  updateVariant,
  deleteVariant,
};
