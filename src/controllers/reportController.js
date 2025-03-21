const Product = require("../models/Product");
const Variant = require("../models/Variant");
const Inventory = require("../models/Inventory");
const { APIError } = require("../middleware/errorHandler");
const apiResponse = require("../utils/apiResponse");

/**
 * Get low stock report
 * @route GET /api/v1/reports/low-stock
 * @access Private
 */
const getLowStockReport = async (req, res, next) => {
  try {
    const { threshold } = req.query;

    // Use provided threshold or get items below their individual thresholds
    const query = threshold
      ? {
          $expr: {
            $lte: [
              { $subtract: ["$quantity", "$reserved"] },
              parseInt(threshold, 10),
            ],
          },
        }
      : {
          $expr: {
            $lte: [
              { $subtract: ["$quantity", "$reserved"] },
              "$lowStockThreshold",
            ],
          },
        };

    // Find low stock inventory items
    const lowStockItems = await Inventory.find(query).populate({
      path: "variant",
      select: "name sku product attributes",
      populate: {
        path: "product",
        select: "name sku",
      },
    });

    // Return response
    return res.status(200).json(
      apiResponse.success("Low stock report retrieved successfully", {
        count: lowStockItems.length,
        items: lowStockItems.map((item) => ({
          product: {
            id: item.variant.product._id,
            name: item.variant.product.name,
            sku: item.variant.product.sku,
          },
          variant: {
            id: item.variant._id,
            name: item.variant.name,
            sku: item.variant.sku,
            attributes: item.variant.attributes,
          },
          inventory: {
            quantity: item.quantity,
            reserved: item.reserved,
            available: item.quantity - item.reserved,
            lowStockThreshold: item.lowStockThreshold,
            reorderPoint: item.reorderPoint,
            reorderQuantity: item.reorderQuantity,
            warehouseLocation: item.warehouseLocation,
          },
        })),
      })
    );
  } catch (error) {
    next(error);
  }
};

/**
 * Get items that need reordering
 * @route GET /api/v1/reports/reorder
 * @access Private
 */
const getReorderReport = async (req, res, next) => {
  try {
    // Find items that need reordering
    const needsReorderItems = await Inventory.find({
      $expr: {
        $lte: [{ $subtract: ["$quantity", "$reserved"] }, "$reorderPoint"],
      },
    }).populate({
      path: "variant",
      select: "name sku product attributes",
      populate: {
        path: "product",
        select: "name sku",
      },
    });

    // Return response
    return res.status(200).json(
      apiResponse.success("Reorder report retrieved successfully", {
        count: needsReorderItems.length,
        items: needsReorderItems.map((item) => ({
          product: {
            id: item.variant.product._id,
            name: item.variant.product.name,
            sku: item.variant.product.sku,
          },
          variant: {
            id: item.variant._id,
            name: item.variant.name,
            sku: item.variant.sku,
            attributes: item.variant.attributes,
          },
          inventory: {
            quantity: item.quantity,
            reserved: item.reserved,
            available: item.quantity - item.reserved,
            lowStockThreshold: item.lowStockThreshold,
            reorderPoint: item.reorderPoint,
            reorderQuantity: item.reorderQuantity,
            warehouseLocation: item.warehouseLocation,
          },
          reorder: {
            recommended: item.reorderQuantity,
          },
        })),
      })
    );
  } catch (error) {
    next(error);
  }
};

/**
 * Get inventory valuation report
 * @route GET /api/v1/reports/inventory-valuation
 * @access Private
 */
const getInventoryValuationReport = async (req, res, next) => {
  try {
    // Get all variants with inventory and price data
    const inventoryItems = await Variant.find()
      .populate("product", "name sku basePrice")
      .populate("inventory");

    // Calculate total value
    let totalValue = 0;
    const items = [];

    for (const item of inventoryItems) {
      // Skip items with no inventory
      if (!item.inventory) continue;

      // Calculate variant price
      const variantPrice = item.product.basePrice + (item.priceDifference || 0);

      // Calculate item value
      const quantity = item.inventory.quantity || 0;
      const itemValue = variantPrice * quantity;

      totalValue += itemValue;

      items.push({
        product: {
          id: item.product._id,
          name: item.product.name,
          sku: item.product.sku,
        },
        variant: {
          id: item._id,
          name: item.name,
          sku: item.sku,
          attributes: item.attributes,
        },
        inventory: {
          quantity: quantity,
          reserved: item.inventory.reserved || 0,
          available: quantity - (item.inventory.reserved || 0),
        },
        valuation: {
          unitPrice: variantPrice,
          totalValue: itemValue,
        },
      });
    }

    // Return response
    return res.status(200).json(
      apiResponse.success("Inventory valuation report retrieved successfully", {
        totalValue,
        count: items.length,
        items,
      })
    );
  } catch (error) {
    next(error);
  }
};

/**
 * Get inventory availability summary
 * @route GET /api/v1/reports/inventory-summary
 * @access Private
 */
const getInventorySummary = async (req, res, next) => {
  try {
    // Get inventory statistics
    const inventoryStats = await Inventory.aggregate([
      {
        $group: {
          _id: null,
          totalItems: { $sum: 1 },
          totalQuantity: { $sum: "$quantity" },
          totalReserved: { $sum: "$reserved" },
          lowStockItems: {
            $sum: {
              $cond: [
                {
                  $lte: [
                    { $subtract: ["$quantity", "$reserved"] },
                    "$lowStockThreshold",
                  ],
                },
                1,
                0,
              ],
            },
          },
          outOfStockItems: {
            $sum: {
              $cond: [
                { $lte: [{ $subtract: ["$quantity", "$reserved"] }, 0] },
                1,
                0,
              ],
            },
          },
          needsReorderItems: {
            $sum: {
              $cond: [
                {
                  $lte: [
                    { $subtract: ["$quantity", "$reserved"] },
                    "$reorderPoint",
                  ],
                },
                1,
                0,
              ],
            },
          },
        },
      },
    ]);

    // Prepare summary data
    const summary =
      inventoryStats.length > 0
        ? inventoryStats[0]
        : {
            totalItems: 0,
            totalQuantity: 0,
            totalReserved: 0,
            lowStockItems: 0,
            outOfStockItems: 0,
            needsReorderItems: 0,
          };

    // Calculate available inventory
    summary.totalAvailable = summary.totalQuantity - summary.totalReserved;

    // Get warehouse distribution
    const warehouseDistribution = await Inventory.aggregate([
      {
        $group: {
          _id: "$warehouseLocation",
          count: { $sum: 1 },
          totalQuantity: { $sum: "$quantity" },
          totalReserved: { $sum: "$reserved" },
        },
      },
      {
        $project: {
          location: "$_id",
          count: 1,
          totalQuantity: 1,
          totalReserved: 1,
          available: { $subtract: ["$totalQuantity", "$totalReserved"] },
          _id: 0,
        },
      },
      { $sort: { location: 1 } },
    ]);

    // Return response
    return res.status(200).json(
      apiResponse.success("Inventory summary retrieved successfully", {
        summary: summary,
        warehouseDistribution,
      })
    );
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getLowStockReport,
  getReorderReport,
  getInventoryValuationReport,
  getInventorySummary,
};
