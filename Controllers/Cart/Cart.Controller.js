const CART_SERVICE = require("../../Service/Cart/Cart.Service");

const CART_CONTROLLER = {
  async createCart(req, res) {
    try {
      const userId = req.user_id; // Lấy user_id từ token hoặc middleware
      const cart = await CART_SERVICE.createCart(userId);
      return res.status(201).json({
        success: true,
        data: cart,
      });
    } catch (error) {
      console.error("Error creating cart:", error.message);
      return res.status(500).json({
        success: false,
        message: "Error creating cart.",
        error: error.message,
      });
    }
  },

  // Thêm sản phẩm vào giỏ hàng
  async addProductToCart(req, res) {
    console.log("User ID:", req.user_id);
    try {
      const { productId, quantity } = req.body; // Lấy productId và quantity từ body
      const userId = req.user_id; // Lấy userId từ token hoặc middleware

      if (!userId || !productId || !quantity) {
        return res.status(400).json({
          success: false,
          message: "User ID, Product ID và Quantity là bắt buộc.",
        });
      }

      const cart = await CART_SERVICE.addProductToCart(
        userId,
        productId,
        quantity
      );
      return res.status(200).json({
        success: true,
        data: cart,
      });
    } catch (error) {
      console.error("Error adding product to cart:", error.message);
      return res.status(500).json({
        success: false,
        message: "Error adding product to cart.",
        error: error.message,
      });
    }
  },

  async removeProductFromCart(req, res) {
    const userId = req.user_id; // Lấy userId từ token hoặc middleware
    const { productId } = req.body; // Lấy productId từ body của request

    try {
      // Gọi hàm removeProductFromCart từ CART_SERVICE để xóa sản phẩm khỏi giỏ hàng
      const updatedCart = await CART_SERVICE.removeProductFromCart(
        userId,
        productId
      );

      // Trả về giỏ hàng đã cập nhật sau khi xóa sản phẩm
      return res.status(200).json({
        success: true,
        data: updatedCart,
      });
    } catch (error) {
      // Xử lý lỗi nếu có trong quá trình xóa sản phẩm khỏi giỏ hàng
      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  },

  async updateProductInCart(req, res) {
    try {
      const { productId, newQuantity } = req.body; 
      const userId = req.user_id; 

      const updatedCart = await CART_SERVICE.updateProductInCart(
        userId,
        productId,
        newQuantity
      );

      // Trả về kết quả cho client
      return res.status(200).json({
        success: true,
        message: "Cập nhật sản phẩm trong giỏ hàng thành công!",
        cart: updatedCart,
      });
    } catch (error) {
      console.error("Error in updateProductInCartController:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to update product in cart",
        error: error.message,
      });
    }
  },

  async getCartByUserId(req, res) {
    try {
      const userId = req.user_id; // Lấy userId từ token hoặc middleware

      if (!userId) {
        return res.status(400).json({
          success: false,
          message: "User ID là bắt buộc.",
        });
      }
      const cart = await CART_SERVICE.getCartWithGroupedProductsByUser(userId);
      return res.status(200).json({
        success: true,
        message: "Cart retrieved successfully",
        data: cart,
      });
    } catch (error) {
      console.error("Error retrieving cart:", error.message);
      return res.status(500).json({
        success: false,
        message: "Error retrieving cart.",
        error: error.message,
      });
    }
  },
};

module.exports = CART_CONTROLLER;
