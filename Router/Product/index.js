const express = require("express");
const router = express.Router();
const PRODUCT_CONTROLLER = require("../../Controllers/Product/Product.Controller");

router.post("/createProduct", PRODUCT_CONTROLLER.createProduct);
router.put("/updateProduct/:id", PRODUCT_CONTROLLER.updateProduct);

module.exports = router;
