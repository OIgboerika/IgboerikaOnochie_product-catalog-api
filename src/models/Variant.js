const mongoose = require("mongoose");

const VariantSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: [true, "Product reference is required"],
    },
    sku: {
      type: String,
      required: [true, "Variant SKU is required"],
      unique: true,
      trim: true,
    },
    name: {
      type: String,
      required: [true, "Variant name is required"],
      trim: true,
    },
    attributes: {
      type: Map,
      of: String,
      required: [true, "Variant attributes are required"],
    },
    priceDifference: {
      type: Number,
      default: 0,
      description: "Price difference from base product price (can be negative)",
    },
    active: {
      type: Boolean,
      default: true,
    },
    images: [
      {
        url: {
          type: String,
          required: true,
        },
        alt: {
          type: String,
          default: "",
        },
        isPrimary: {
          type: Boolean,
          default: false,
        },
      },
    ],
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual for inventory
VariantSchema.virtual("inventory", {
  ref: "Inventory",
  localField: "_id",
  foreignField: "variant",
  justOne: true,
});

module.exports = mongoose.model("Variant", VariantSchema);
