const Category = require("../models/Category");
const logger = require("../utils/logger");

class CategoryService {
  async createCategory(categoryData) {
    try {
      const category = new Category(categoryData);
      await category.save();
      return category;
    } catch (error) {
      logger.error("Error creating category:", error);
      throw error;
    }
  }

  async getAllCategories() {
    try {
      return await Category.find();
    } catch (error) {
      logger.error("Error fetching categories:", error);
      throw error;
    }
  }

  async updateCategory(id, updateData) {
    try {
      return await Category.findByIdAndUpdate(id, updateData, { new: true });
    } catch (error) {
      logger.error("Error updating category:", error);
      throw error;
    }
  }

  async deleteCategory(id) {
    try {
      await Category.findByIdAndDelete(id);
      return true;
    } catch (error) {
      logger.error("Error deleting category:", error);
      throw error;
    }
  }
}

module.exports = new CategoryService();
