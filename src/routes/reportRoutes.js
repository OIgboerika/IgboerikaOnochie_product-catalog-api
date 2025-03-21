const express = require("express");
const router = express.Router();
const reportController = require("../controllers/reportController");

router.get("/low-stock", reportController.getLowStockReport);
router.get("/inventory-value", reportController.getInventoryValueReport);
router.get("/category-summary", reportController.getCategorySummary);
router.get("/product-variants", reportController.getProductVariantsReport);

module.exports = router;
