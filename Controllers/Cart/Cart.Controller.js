const CART_SERVICE = require("../../Service/Cart/Cart.Service");

const CART_CONTROLLER = {
  async createCart(req, res) {
    try {
      const userId = req.user_id;
      console.log(userId);

      const cartData = req.body;
      const newCart = await CART_SERVICE.createCart(cartData, userId);
      return res.status(201).json({
        success: true,
        data: newCart,
      });
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  },

  async updateCart(req, res) {
    try {
      const { cartId } = req.params;
      const updatedData = req.body;
      const updatedCart = await CART_SERVICE.updateCart(cartId, updatedData);
      if (!updatedCart) {
        return res.status(404).json({ message: "Cart not found" });
      }
      return res.status(200).json(updatedCart);
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  },

  async addProductToCart(req, res) {
    try {
      const userId = req.user_id; // Lấy userId từ request
      const productItem = req.body; // Dữ liệu sản phẩm gửi lên

      // Kiểm tra dữ liệu đầu vào
      if (!userId || !productItem.PRODUCT_ID || !productItem.QUANTITY) {
        return res.status(400).json({ message: "Invalid input data" });
      }
      const updatedCart = await CART_SERVICE.addProductToCart(
        userId,
        productItem
      );

      return res.status(200).json({
        success: true,
        data: updatedCart,
      });
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  },

  async removeProductFromCart(req, res) {
    try {
      const { cartId, productId } = req.params;
      const updatedCart = await CART_SERVICE.removeProductFromCart(
        cartId,
        productId
      );
      if (!updatedCart) {
        return res.status(404).json({ message: "Cart not found" });
      }
      return res.status(200).json(updatedCart);
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  },

  async getCart(req, res) {
    try {
      const { cartId } = req.params;
      const cart = await CART_SERVICE.getCart(cartId);
      if (!cart) {
        return res.status(404).json({ message: "Cart not found" });
      }
      return res.status(200).json(cart);
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  },

  async getCartByUserId(req, res) {
    try {
      const userId = req.user_id;
      console.log(userId);
      const cart = await CART_SERVICE.getCartByUserId(userId);

      return res.status(200).json({
        success: true,
        message: "Cart retrieved successfully",
        cart: cart,
      });
    } catch (error) {
      console.error("Error in getCartByUserIdController:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to retrieve cart",
        error: error.message,
      });
    }
  },
};

module.exports = CART_CONTROLLER;
