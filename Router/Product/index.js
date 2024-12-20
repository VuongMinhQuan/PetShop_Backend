const express = require("express");
const router = express.Router();
const PRODUCT_CONTROLLER = require("../../Controllers/Product/Product.Controller");
const upload = require("../../Config/multerConfig");
const {
  verifyToken,
  verifyTokenAdmin,
} = require("../../Middleware/verifyToken");
const authorizeRoles = require("../../Middleware/authorizeRoles");

router.post(
  "/createProduct",
  verifyToken,
  authorizeRoles("ADMIN"),
  upload,
  PRODUCT_CONTROLLER.createProduct
);
router.put(
  "/updateProduct/:productId",
  verifyToken,
  authorizeRoles("ADMIN"),
  upload,
  PRODUCT_CONTROLLER.updateProduct
);
router.delete(
  "/deleteProduct/:productId",
  verifyToken,
  authorizeRoles("ADMIN"),
  upload,
  PRODUCT_CONTROLLER.deleteProduct
);
router.get("/getLatestProducts", PRODUCT_CONTROLLER.getLatestProducts);
router.get(
  "/getAllProducts",
//   verifyToken,
//   authorizeRoles("ADMIN"),
  PRODUCT_CONTROLLER.getAllProducts
);
router.get("/search", PRODUCT_CONTROLLER.searchProductByName);
router.post("/filter", PRODUCT_CONTROLLER.getProductsBySubType)
router.get("/getProduct/:productId", PRODUCT_CONTROLLER.getProductById);
router.get("/getAccompanyProduct/:productId", PRODUCT_CONTROLLER.getAccompanyingProducts);
router.get(
  "/totalCount",
  PRODUCT_CONTROLLER.getTotalProductCountController
);

module.exports = router;
