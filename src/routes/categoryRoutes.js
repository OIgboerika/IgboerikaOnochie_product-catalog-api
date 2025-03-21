const express = require("express");
const router = express.Router();
const categoryController = require("../controllers/categoryController");
const validate = require("../middleware/validate");

router.post("/", validate.category, categoryController.createCategory);
router.get("/", categoryController.getAllCategories);
router.get("/:id", categoryController.getCategoryById);
router.put("/:id", validate.category, categoryController.updateCategory);
router.delete("/:id", categoryController.deleteCategory);
router.get("/:id/products", categoryController.getCategoryProducts);

module.exports = router;
