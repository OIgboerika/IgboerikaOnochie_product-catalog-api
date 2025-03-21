const Product = require("../models/Product");
const apiResponse = require("../utils/apiResponse");
const logger = require("../utils/logger");

class ProductService {
  async createProduct(productData) {
    try {
      const product = new Product(productData);
      await product.save();
      return product;
    } catch (error) {
      logger.error("Error creating product:", error);
      throw error;
    }
  }

  async updateProduct(id, updateData) {
    try {
      const product = await Product.findByIdAndUpdate(id, updateData, {
        new: true,
      });
      return product;
    } catch (error) {
      logger.error("Error updating product:", error);
      throw error;
    }
  }

  async deleteProduct(id) {
    try {
      await Product.findByIdAndDelete(id);
      return true;
    } catch (error) {
      logger.error("Error deleting product:", error);
      throw error;
    }
  }

  async getProductById(id) {
    try {
      const product = await Product.findById(id).populate("category variants");
      return product;
    } catch (error) {
      logger.error("Error fetching product:", error);
      throw error;
    }
  }
}

module.exports = new ProductService();
