const mongoose = require("mongoose");

const InventorySchema = new mongoose.Schema(
  {
    variant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Variant",
      required: [true, "Variant reference is required"],
    },
    quantity: {
      type: Number,
      required: [true, "Quantity is required"],
      min: [0, "Quantity cannot be negative"],
    },
    reserved: {
      type: Number,
      default: 0,
      min: [0, "Reserved quantity cannot be negative"],
    },
    lowStockThreshold: {
      type: Number,
      default: 5,
      min: [0, "Low stock threshold cannot be negative"],
    },
    reorderPoint: {
      type: Number,
      default: 10,
      min: [1, "Reorder point must be at least 1"],
    },
    reorderQuantity: {
      type: Number,
      default: 20,
      min: [1, "Reorder quantity must be at least 1"],
    },
    warehouseLocation: {
      type: String,
      default: "Main Warehouse",
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

// Virtual for available quantity
InventorySchema.virtual("available").get(function () {
  return Math.max(0, this.quantity - this.reserved);
});

// Virtual for low stock status
InventorySchema.virtual("isLowStock").get(function () {
  return this.available <= this.lowStockThreshold;
});

// Virtual for needs reordering status
InventorySchema.virtual("needsReorder").get(function () {
  return this.available <= this.reorderPoint;
});

module.exports = mongoose.model("Inventory", InventorySchema);
