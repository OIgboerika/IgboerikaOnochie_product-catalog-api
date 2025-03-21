const express = require("express");
const router = express.Router();
const inventoryController = require("../controllers/inventoryController");
const validate = require("../middleware/validate");

router.post("/update", validate.inventory, inventoryController.updateInventory);
router.get("/product/:productId", inventoryController.getProductInventory);
router.get("/variant/:variantId", inventoryController.getVariantInventory);
router.post(
  "/adjust",
  validate.inventoryAdjustment,
  inventoryController.adjustInventory
);
router.get("/low-stock", inventoryController.getLowStockItems);

module.exports = router;
