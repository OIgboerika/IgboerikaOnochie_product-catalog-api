const Product = require("../models/Product");
const Category = require("../models/Category");
const logger = require("../utils/logger");

class SearchService {
  async searchProducts(query) {
    try {
      const searchQuery = {
        $or: [
          { name: { $regex: query, $options: "i" } },
          { description: { $regex: query, $options: "i" } },
          { tags: { $regex: query, $options: "i" } },
        ],
      };
      return await Product.find(searchQuery);
    } catch (error) {
      logger.error("Error searching products:", error);
      throw error;
    }
  }

  async searchCategories(query) {
    try {
      return await Category.find({
        name: { $regex: query, $options: "i" },
      });
    } catch (error) {
      logger.error("Error searching categories:", error);
      throw error;
    }
  }

  async getSearchSuggestions(prefix) {
    try {
      const products = await Product.find({
        name: { $regex: `^${prefix}`, $options: "i" },
      }).limit(5);
      return products.map((p) => p.name);
    } catch (error) {
      logger.error("Error getting search suggestions:", error);
      throw error;
    }
  }
}

module.exports = new SearchService();
