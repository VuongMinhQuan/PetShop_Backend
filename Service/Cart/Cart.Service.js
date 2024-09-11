const Cart = require("../../Model/Cart/Cart.Model");
const Product = require("../../Model/Product/Product.Model"); // Import model sản phẩm

const CART_SERVICE = {
  async calculateTotalPrice(cart) {
    try {
      let totalPrice = 0;

      for (const productItem of cart.LIST_PRODUCT) {
        const product = await Product.findById(productItem.PRODUCT_ID).lean(); // Lấy thông tin sản phẩm
        if (product) {
          totalPrice += product.PRICE * productItem.QUANTITY; // Tính tổng giá
        }
      }

      return totalPrice;
    } catch (error) {
      throw new Error("Error calculating total price: " + error.message);
    }
  },

  async createCart(cartData, userId) {
    try {
      const totalPrice = await this.calculateTotalPrice(cartData);
      cartData.TOTAL_PRICE = totalPrice;
      const newCart = new Cart({
        USER_ID: userId,
        LIST_PRODUCT: cartData.LIST_PRODUCT || [],
        TOTAL_PRICE: totalPrice,
      });
      return await newCart.save();
    } catch (error) {
      throw new Error("Error creating cart: " + error.message);
    }
  },

  async updateCart(cartId, updatedData) {
    try {
      const totalPrice = await this.calculateTotalPrice(updatedData);
      updatedData.TOTAL_PRICE = totalPrice;
      return await Cart.findByIdAndUpdate(cartId, updatedData, { new: true });
    } catch (error) {
      throw new Error("Error updating cart: " + error.message);
    }
  },

  async addProductToCart(userId, productItem) {
  try {
    // Kiểm tra xem người dùng đã có giỏ hàng hay chưa
    let cart = await Cart.findOne({ USER_ID: userId });

    // Nếu chưa có giỏ hàng, tạo giỏ hàng mới và thêm sản phẩm vào
    if (!cart) {
      const product = await Product.findById(productItem.PRODUCT_ID).lean();
      if (!product) {
        throw new Error("Product not found");
      }
      
      const cartData = {
        LIST_PRODUCT: [productItem], // Thêm sản phẩm đầu tiên vào giỏ hàng
        TOTAL_PRICE: productItem.QUANTITY * product.PRICE // Tính toán giá tiền tổng
      };
      cart = await this.createCart(cartData, userId); // Tạo giỏ hàng mới
      return cart;
    }

    // Đảm bảo LIST_PRODUCT là mảng
    if (!Array.isArray(cart.LIST_PRODUCT)) {
      cart.LIST_PRODUCT = [];
    }

    // Kiểm tra sản phẩm đã tồn tại chưa
    const existingProductIndex = cart.LIST_PRODUCT.findIndex(
      (item) =>
        item.PRODUCT_ID.toString() === productItem.PRODUCT_ID.toString()
    );

    if (existingProductIndex !== -1) {
      // Nếu sản phẩm đã tồn tại, tăng số lượng
      const existingProduct = cart.LIST_PRODUCT[existingProductIndex];
      existingProduct.QUANTITY += productItem.QUANTITY;

      // Tính toán lại tổng giá tiền
      const product = await Product.findById(existingProduct.PRODUCT_ID).lean();
      if (product) {
        cart.TOTAL_PRICE += product.PRICE * productItem.QUANTITY;
      } else {
        throw new Error("Product not found");
      }
    } else {
      // Nếu sản phẩm chưa tồn tại, thêm vào danh sách
      cart.LIST_PRODUCT.push(productItem);

      // Tính toán tổng giá tiền cho sản phẩm mới thêm vào
      const product = await Product.findById(productItem.PRODUCT_ID).lean();
      if (product) {
        cart.TOTAL_PRICE += product.PRICE * productItem.QUANTITY;
      } else {
        throw new Error("Product not found");
      }
    }

    // Lưu giỏ hàng sau khi cập nhật
    return await cart.save();
  } catch (error) {
    throw new Error("Error adding product to cart: " + error.message);
  }
},


  async removeProductFromCart(cartId, productId) {
    try {
      const cart = await Cart.findById(cartId);
      if (!cart) throw new Error("Cart not found");

      // Remove the product from cart
      cart.LIST_PRODUCT = cart.LIST_PRODUCT.filter(
        (item) => item.PRODUCT_ID.toString() !== productId.toString()
      );

      const totalPrice = await this.calculateTotalPrice(cart);
      cart.TOTAL_PRICE = totalPrice;
      return await cart.save();
    } catch (error) {
      throw new Error("Error removing product from cart: " + error.message);
    }
  },

  async getCart(cartId) {
    try {
      const cart = await Cart.findById(cartId).lean();

      if (!cart) {
        throw new Error("Cart not found");
      }

      // Duyệt qua từng sản phẩm trong giỏ và lấy thông tin chi tiết của sản phẩm
      const detailedProducts = await Promise.all(
        cart.LIST_PRODUCT.map(async (productItem) => {
          const product = await Product.findById(productItem.PRODUCT_ID).lean();
          if (product) {
            return {
              ...productItem,
              productDetails: product, // Gắn thông tin chi tiết sản phẩm
            };
          } else {
            return productItem; // Trả về nếu sản phẩm không còn tồn tại
          }
        })
      );

      return {
        ...cart,
        LIST_PRODUCT: detailedProducts, // Thay thế LIST_PRODUCT với thông tin chi tiết của sản phẩm
      };
    } catch (error) {
      throw new Error("Error getting cart details: " + error.message);
    }
  },

  async getCartByUserId(userId) {
    try {
      const cart = await Cart.findOne({ USER_ID: userId }).lean();
      if (!cart) {
        throw new Error("Cart not found");
      }
      return cart;
    } catch (error) {
      throw new Error("Error getting cart by user ID: " + error.message);
    }
  },
};

module.exports = CART_SERVICE;
