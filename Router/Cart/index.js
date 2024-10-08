const express = require("express");
const router = express.Router();
const CART_CONTROLLER = require("../../Controllers/Cart/Cart.Controller")
const{
    verifyToken,
    verifyTokenAdmin,
} = require("../../Middleware/verifyToken");

router.post("/createCart", verifyToken, CART_CONTROLLER.createCart);
router.post("/getCartById", verifyToken, CART_CONTROLLER.getCartByUserId);
router.put("/updateCart",verifyToken, CART_CONTROLLER.updateProductInCart);
router.post("/removeProduct", verifyToken, CART_CONTROLLER.removeProductFromCart)
router.put(
  "/addProduct",
  verifyToken,
  CART_CONTROLLER.addProductToCart
);
router.put(
    "/updateCart/:cartId/deleteProduct/:productId",
    CART_CONTROLLER.removeProductFromCart
);

module.exports = router;