const express = require("express");
const router = express.Router();
const searchService = require("../services/searchService");

router.get("/products", searchService.searchProducts);
router.get("/categories", searchService.searchCategories);
router.get("/suggestions", searchService.getSearchSuggestions);

module.exports = router;
