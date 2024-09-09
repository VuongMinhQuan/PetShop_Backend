const express = require("express");
const router = express.Router();
const PRODUCT_CONTROLLER = require("../../Controllers/Product/Product.Controller");

router.post("/createProduct", PRODUCT_CONTROLLER.createProduct);
router.put("/updateProduct/:productId", PRODUCT_CONTROLLER.updateProduct);
router.get("/getAllProducts", PRODUCT_CONTROLLER.getAllProducts);
router.delete("/deleteProduct/:productId", PRODUCT_CONTROLLER.deleteProduct);

module.exports = router;
