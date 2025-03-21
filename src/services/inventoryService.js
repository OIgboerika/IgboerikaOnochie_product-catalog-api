const Inventory = require("../models/Inventory");
const Product = require("../models/Product");
const logger = require("../utils/logger");

class InventoryService {
  async updateInventory(productId, variantId, quantity) {
    try {
      const inventory = await Inventory.findOneAndUpdate(
        { product: productId, variant: variantId },
        { quantity },
        { new: true, upsert: true }
      );
      return inventory;
    } catch (error) {
      logger.error("Error updating inventory:", error);
      throw error;
    }
  }

  async getLowStockItems(threshold = 10) {
    try {
      return await Inventory.find({ quantity: { $lte: threshold } }).populate(
        "product variant"
      );
    } catch (error) {
      logger.error("Error getting low stock items:", error);
      throw error;
    }
  }

  async adjustInventory(productId, variantId, adjustment) {
    try {
      const inventory = await Inventory.findOne({
        product: productId,
        variant: variantId,
      });
      inventory.quantity += adjustment;
      await inventory.save();
      return inventory;
    } catch (error) {
      logger.error("Error adjusting inventory:", error);
      throw error;
    }
  }
}

module.exports = new InventoryService();
