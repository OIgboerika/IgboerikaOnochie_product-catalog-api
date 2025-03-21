const Inventory = require("../models/Inventory");
const Variant = require("../models/Variant");
const { APIError } = require("../middleware/errorHandler");
const apiResponse = require("../utils/apiResponse");

/**
 * Get inventory for a variant
 * @route GET /api/v1/variants/:variantId/inventory
 * @access Public
 */
const getInventory = async (req, res, next) => {
  try {
    const { variantId } = req.params;

    // Check if variant exists
    const variant = await Variant.findById(variantId);
    if (!variant) {
      throw new APIError(`Variant not found with ID: ${variantId}`, 404);
    }

    // Get inventory
    const inventory = await Inventory.findOne({ variant: variantId });

    // If no inventory record exists, create a default one
    if (!inventory) {
      const newInventory = await Inventory.create({
        variant: variantId,
        quantity: 0,
      });

      return res
        .status(200)
        .json(
          apiResponse.success("Inventory retrieved successfully", {
            inventory: newInventory,
          })
        );
    }

    // Return response
    return res
      .status(200)
      .json(
        apiResponse.success("Inventory retrieved successfully", { inventory })
      );
  } catch (error) {
    next(error);
  }
};

/**
 * Create or update inventory for a variant
 * @route PUT /api/v1/variants/:variantId/inventory
 * @access Private
 */
const updateInventory = async (req, res, next) => {
  try {
    const { variantId } = req.params;
    const {
      quantity,
      reserved,
      lowStockThreshold,
      reorderPoint,
      reorderQuantity,
      warehouseLocation,
    } = req.body;

    // Check if variant exists
    const variant = await Variant.findById(variantId);
    if (!variant) {
      throw new APIError(`Variant not found with ID: ${variantId}`, 404);
    }

    // Find existing inventory
    let inventory = await Inventory.findOne({ variant: variantId });

    // If no inventory record exists, create a new one
    if (!inventory) {
      inventory = await Inventory.create({
        variant: variantId,
        quantity: quantity || 0,
        reserved: reserved || 0,
        lowStockThreshold: lowStockThreshold || 5,
        reorderPoint: reorderPoint || 10,
        reorderQuantity: reorderQuantity || 20,
        warehouseLocation: warehouseLocation || "Main Warehouse",
      });
    } else {
      // Update existing inventory
      inventory = await Inventory.findOneAndUpdate(
        { variant: variantId },
        {
          quantity: quantity !== undefined ? quantity : inventory.quantity,
          reserved: reserved !== undefined ? reserved : inventory.reserved,
          lowStockThreshold:
            lowStockThreshold !== undefined
              ? lowStockThreshold
              : inventory.lowStockThreshold,
          reorderPoint:
            reorderPoint !== undefined ? reorderPoint : inventory.reorderPoint,
          reorderQuantity:
            reorderQuantity !== undefined
              ? reorderQuantity
              : inventory.reorderQuantity,
          warehouseLocation:
            warehouseLocation !== undefined
              ? warehouseLocation
              : inventory.warehouseLocation,
        },
        { new: true, runValidators: true }
      );
    }

    // Return response
    return res
      .status(200)
      .json(
        apiResponse.success("Inventory updated successfully", { inventory })
      );
  } catch (error) {
    next(error);
  }
};

/**
 * Adjust inventory quantity
 * @route PATCH /api/v1/variants/:variantId/inventory/adjust
 * @access Private
 */
const adjustInventory = async (req, res, next) => {
  try {
    const { variantId } = req.params;
    const { adjustment, reason } = req.body;

    // Validate adjustment
    if (!adjustment) {
      throw new APIError("Adjustment value is required", 400);
    }

    const adjustmentValue = parseInt(adjustment, 10);
    if (isNaN(adjustmentValue)) {
      throw new APIError("Adjustment must be a valid number", 400);
    }

    // Find inventory
    const inventory = await Inventory.findOne({ variant: variantId });
    if (!inventory) {
      throw new APIError(
        `Inventory not found for variant ID: ${variantId}`,
        404
      );
    }

    // Calculate new quantity
    const newQuantity = inventory.quantity + adjustmentValue;
    if (newQuantity < 0) {
      throw new APIError("Adjustment would result in negative inventory", 400);
    }

    // Update inventory
    const updatedInventory = await Inventory.findOneAndUpdate(
      { variant: variantId },
      {
        quantity: newQuantity,
        $push: {
          adjustmentLog: {
            adjustment: adjustmentValue,
            reason: reason || "Manual adjustment",
            date: new Date(),
          },
        },
      },
      { new: true, runValidators: true }
    );

    // Return response
    return res.status(200).json(
      apiResponse.success("Inventory adjusted successfully", {
        inventory: updatedInventory,
        adjustment: {
          previous: inventory.quantity,
          current: updatedInventory.quantity,
          difference: adjustmentValue,
        },
      })
    );
  } catch (error) {
    next(error);
  }
};

/**
 * Reserve inventory
 * @route PATCH /api/v1/variants/:variantId/inventory/reserve
 * @access Private
 */
const reserveInventory = async (req, res, next) => {
  try {
    const { variantId } = req.params;
    const { quantity, reference } = req.body;

    // Validate quantity
    if (!quantity) {
      throw new APIError("Quantity to reserve is required", 400);
    }

    const reserveQuantity = parseInt(quantity, 10);
    if (isNaN(reserveQuantity) || reserveQuantity <= 0) {
      throw new APIError("Quantity must be a positive number", 400);
    }

    // Find inventory
    const inventory = await Inventory.findOne({ variant: variantId });
    if (!inventory) {
      throw new APIError(
        `Inventory not found for variant ID: ${variantId}`,
        404
      );
    }

    // Check if enough inventory is available
    if (inventory.quantity - inventory.reserved < reserveQuantity) {
      throw new APIError("Not enough available inventory to reserve", 400);
    }

    // Update reserved quantity
    const updatedInventory = await Inventory.findOneAndUpdate(
      { variant: variantId },
      {
        reserved: inventory.reserved + reserveQuantity,
        $push: {
          reservationLog: {
            quantity: reserveQuantity,
            reference: reference || "Manual reservation",
            date: new Date(),
          },
        },
      },
      { new: true, runValidators: true }
    );

    // Return response
    return res.status(200).json(
      apiResponse.success("Inventory reserved successfully", {
        inventory: updatedInventory,
        reservation: {
          quantity: reserveQuantity,
          reference: reference || "Manual reservation",
        },
      })
    );
  } catch (error) {
    next(error);
  }
};

/**
 * Release reserved inventory
 * @route PATCH /api/v1/variants/:variantId/inventory/release
 * @access Private
 */
const releaseInventory = async (req, res, next) => {
  try {
    const { variantId } = req.params;
    const { quantity, reference } = req.body;

    // Validate quantity
    if (!quantity) {
      throw new APIError("Quantity to release is required", 400);
    }

    const releaseQuantity = parseInt(quantity, 10);
    if (isNaN(releaseQuantity) || releaseQuantity <= 0) {
      throw new APIError("Quantity must be a positive number", 400);
    }

    // Find inventory
    const inventory = await Inventory.findOne({ variant: variantId });
    if (!inventory) {
      throw new APIError(
        `Inventory not found for variant ID: ${variantId}`,
        404
      );
    }

    // Check if enough inventory is reserved
    if (inventory.reserved < releaseQuantity) {
      throw new APIError("Cannot release more than reserved quantity", 400);
    }

    // Update reserved quantity
    const updatedInventory = await Inventory.findOneAndUpdate(
      { variant: variantId },
      {
        reserved: inventory.reserved - releaseQuantity,
        $push: {
          releaseLog: {
            quantity: releaseQuantity,
            reference: reference || "Manual release",
            date: new Date(),
          },
        },
      },
      { new: true, runValidators: true }
    );

    // Return response
    return res.status(200).json(
      apiResponse.success("Reserved inventory released successfully", {
        inventory: updatedInventory,
        release: {
          quantity: releaseQuantity,
          reference: reference || "Manual release",
        },
      })
    );
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getInventory,
  updateInventory,
  adjustInventory,
  reserveInventory,
  releaseInventory,
};
