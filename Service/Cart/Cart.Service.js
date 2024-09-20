const Cart = require("../../Model/Cart/Cart.Model");
const Product = require("../../Model/Product/Product.Model"); // Import model sản phẩm
const mongoose = require("mongoose");

const CART_SERVICE = {
  async createCart(userId) {
    const newCart = new Cart({
      USER_ID: userId,
      LIST_PRODUCT: [],
    });
    return await newCart.save();
  },

  async addProductToCart(userId, productId, quantity) {
    // Tìm giỏ hàng của người dùng
    let cart = await Cart.findOne({ USER_ID: userId });

    // Nếu giỏ hàng không tồn tại, tạo giỏ hàng mới
    if (!cart) {
      cart = await this.createCart(userId);
    }

    // Tìm sản phẩm theo productId
    const product = await Product.findById(productId);
    if (!product) {
      throw new Error("Product not found");
    }

    // Kiểm tra sản phẩm đã tồn tại trong giỏ hàng hay chưa
    const productExists = cart.LIST_PRODUCT.find(
      (item) => item.PRODUCT_ID.toString() === productId.toString()
    );

    if (productExists) {
      // Nếu sản phẩm đã tồn tại, tăng số lượng của sản phẩm đó lên
      productExists.QUANTITY += quantity;
    } else {
      // Nếu sản phẩm chưa tồn tại, thêm sản phẩm mới vào giỏ hàng
      cart.LIST_PRODUCT.push({
        PRODUCT_ID: productId,
        QUANTITY: quantity,
      });
    }

    // Lưu thay đổi giỏ hàng
    await cart.save();

    return cart;
  },

  async removeProductFromCart(userId, productId) {
    // Tìm giỏ hàng của người dùng
    const cart = await Cart.findOne({ USER_ID: userId });
    if (!cart) {
      throw new Error("Cart not found");
    }

    // Tìm sản phẩm trong giỏ hàng
    const productIndex = cart.LIST_PRODUCT.findIndex(
      (item) => item.PRODUCT_ID.toString() === productId.toString()
    );
    if (productIndex === -1) {
      throw new Error("Product not found in cart");
    }

    // Xóa sản phẩm khỏi giỏ hàng
    cart.LIST_PRODUCT.splice(productIndex, 1);

    // Lưu thay đổi giỏ hàng
    await cart.save();

    return cart;
  },

  async updateProductInCart(userId, productId, newQuantity) {
    // Tìm giỏ hàng của người dùng
    let cart = await Cart.findOne({ USER_ID: userId });
    if (!cart) {
      throw new Error("Cart not found");
    }

    // Tìm sản phẩm trong giỏ hàng
    const productIndex = cart.LIST_PRODUCT.findIndex(
      (product) => product.PRODUCT_ID.toString() === productId.toString()
    );
    if (productIndex === -1) {
      throw new Error("Product not found in cart");
    }

    // Cập nhật thông tin số lượng của sản phẩm
    cart.LIST_PRODUCT[productIndex].QUANTITY = newQuantity;

    // Lưu thay đổi giỏ hàng
    await cart.save();

    return cart;
  },

  async getCartWithGroupedProductsByUser(userId) {
    const cart = await Cart.aggregate([
      {
        $match: { USER_ID: new mongoose.Types.ObjectId(userId) },
      },
      {
        $unwind: { path: "$LIST_PRODUCT", preserveNullAndEmptyArrays: true },
      },
      {
        $lookup: {
          from: "products", // Tên collection chứa thông tin sản phẩm
          localField: "LIST_PRODUCT.PRODUCT_ID",
          foreignField: "_id",
          as: "productDetails",
        },
      },
      {
        $unwind: { path: "$productDetails", preserveNullAndEmptyArrays: true },
      },
      {
        $addFields: {
          "LIST_PRODUCT.TOTAL_PRICE_FOR_PRODUCT": {
            $multiply: [
              "$productDetails.PRICE", // Giá sản phẩm lấy từ chi tiết sản phẩm
              "$LIST_PRODUCT.QUANTITY", // Nhân với số lượng sản phẩm
            ],
          },
        },
      },
      {
        $group: {
          _id: "$USER_ID",
          PRODUCTS: { $push: "$LIST_PRODUCT" },
          TOTAL_CART_PRICE: { $sum: "$LIST_PRODUCT.TOTAL_PRICE_FOR_PRODUCT" }, // Tổng giá giỏ hàng
        },
      },
      {
        $project: {
          _id: 0,
          USER_ID: "$_id",
          PRODUCTS: 1,
          TOTAL_CART_PRICE: 1,
        },
      },
    ]);

    console.log(cart); // Kiểm tra kết quả để xác định nếu có vấn đề với bước nào
    if (!cart || cart.length === 0) {
      throw new Error("Cart not found");
    }

    return cart[0];
  },
};

module.exports = CART_SERVICE;
