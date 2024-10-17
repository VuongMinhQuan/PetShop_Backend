const BOOKING_MODEL = require("../../Model/Booking/Booking.Model");
const CART_MODEL = require("../../Model/Cart/Cart.Model");
const PRODUCT_MODEL = require("../../Model/Product/Product.Model");
const USER_MODEL = require("../../Model/User/User.Model");
const CART_SERVICE = require("../../Service/Cart/Cart.Service");
class BOOKING_SERVICE {
  // Đặt sản phẩm ngay lập tức mà không cần giỏ hàng
  async bookProductNow(userId, productDetails) {
    // Tìm sản phẩm theo ID
    const product = await PRODUCT_MODEL.findById(productDetails.PRODUCT_ID);

    if (!product) {
      throw new Error("Sản phẩm không tồn tại.");
    }

    // Tính tổng giá dựa trên số lượng và giá sản phẩm
    const totalPriceProduct = productDetails.QUANTITY * product.PRICE;

    // Tạo booking mới cho sản phẩm
    const booking = new BOOKING_MODEL({
      USER_ID: userId,
      LIST_PRODUCT: [
        {
          PRODUCT_ID: productDetails.PRODUCT_ID,
          QUANTITY: productDetails.QUANTITY,
          TOTAL_PRICE_PRODUCT: totalPriceProduct,
        },
      ],
      TOTAL_PRICE: totalPriceProduct, // Tổng giá cho booking là giá sản phẩm
      STATUS: "NotYetPaid",
      CUSTOMER_PHONE: productDetails.CUSTOMER_PHONE,
      CUSTOMER_NAME: productDetails.CUSTOMER_NAME,
    });

    // Lưu booking vào database
    await booking.save();

    return booking;
  }

  async bookProductNows(userId, productsDetails) {
    let listProducts = [];
    let totalPrice = 0;

    // Kiểm tra nếu chỉ có một sản phẩm (object) hoặc nhiều sản phẩm (array)
    const isSingleProduct = !Array.isArray(productsDetails);

    if (isSingleProduct) {
      // Trường hợp chỉ có một sản phẩm
      productsDetails = [productsDetails]; // Chuyển object thành mảng để xử lý dễ hơn
    }

    // Lấy thông tin người dùng nếu thiếu thông tin CUSTOMER_PHONE và CUSTOMER_NAME
    let userProfile;
    if (
      !productsDetails[0].CUSTOMER_PHONE ||
      !productsDetails[0].CUSTOMER_NAME ||
      !productsDetails[0].CUSTOMER_ADDRESS
    ) {
      // Lấy thông tin người dùng từ cơ sở dữ liệu bằng userId
      userProfile = await USER_MODEL.findById(userId);

      if (!userProfile) {
        throw new Error("Không tìm thấy thông tin người dùng.");
      }
    }

    for (const productDetails of productsDetails) {
      const productId = productDetails.productId || productDetails.PRODUCT_ID;
      const product = await PRODUCT_MODEL.findById(productId);

      if (!product) {
        throw new Error("Sản phẩm không tồn tại.");
      }

      // Tính tổng giá cho từng sản phẩm
      const totalPriceProduct = productDetails.QUANTITY * product.PRICE;

      // Thêm sản phẩm vào danh sách sản phẩm trong booking
      listProducts.push({
        PRODUCT_ID: productId,
        QUANTITY: productDetails.QUANTITY,
        TOTAL_PRICE_PRODUCT: totalPriceProduct,
      });

      // Cộng tổng giá sản phẩm vào tổng giá booking
      totalPrice += totalPriceProduct;
    }

    // Tạo booking mới với danh sách sản phẩm và lấy thông tin người dùng nếu thiếu
    const booking = new BOOKING_MODEL({
      USER_ID: userId,
      LIST_PRODUCT: listProducts, // Danh sách các sản phẩm đã đặt
      TOTAL_PRICE: totalPrice, // Tổng giá cho tất cả các sản phẩm
      STATUS: "NotYetPaid", // Trạng thái booking ban đầu
      CUSTOMER_PHONE:
        productsDetails[0].CUSTOMER_PHONE || userProfile.PHONE_NUMBER, // Nếu không có, lấy từ profile
      CUSTOMER_NAME: productsDetails[0].CUSTOMER_NAME || userProfile.FULLNAME,
      CUSTOMER_ADDRESS:
        productsDetails[0].CUSTOMER_ADDRESS || userProfile.ADDRESS, // Nếu không có, lấy từ profile
    });

    // Lưu booking vào database
    await booking.save();
    for (const product of listProducts) {
      await CART_SERVICE.removeProductFromCart(userId, product.PRODUCT_ID);
    }
    return booking;
  }

  // Đặt sản phẩm từ giỏ hàng
  async bookFromCart(userId, bookingData) {
    // Tìm giỏ hàng của người dùng
    const cart = await CART_MODEL.findOne({ USER_ID: userId }).populate(
      "LIST_PRODUCT.PRODUCT_ID"
    );
    if (!cart) {
      throw new Error("Không tìm thấy giỏ hàng");
    }

    // Tính tổng giá tiền cho từng sản phẩm và tổng cộng
    let totalBookingPrice = 0;
    const products = await Promise.all(
      cart.LIST_PRODUCT.map(async (product) => {
        if (!product.PRODUCT_ID) {
          throw new Error(
            `Sản phẩm với ID ${product._id} không tồn tại trong cơ sở dữ liệu`
          );
        }

        // Lấy thông tin chi tiết của sản phẩm từ collection "products"
        const productDetails = await PRODUCT_MODEL.findById(product.PRODUCT_ID);

        if (!productDetails) {
          throw new Error(
            `Không tìm thấy chi tiết sản phẩm với ID ${product.PRODUCT_ID}`
          );
        }

        // Tính toán tổng giá cho sản phẩm
        const totalPriceForProduct = productDetails.PRICE * product.QUANTITY;

        // Cộng giá sản phẩm vào tổng giá booking
        totalBookingPrice += totalPriceForProduct;

        return {
          PRODUCT_ID: product.PRODUCT_ID._id,
          QUANTITY: product.QUANTITY,
          TOTAL_PRICE_PRODUCT: totalPriceForProduct,
        };
      })
    );

    // Tạo booking với giá đã tính
    const booking = new BOOKING_MODEL({
      USER_ID: userId,
      LIST_PRODUCT: products,
      TOTAL_PRICE: totalBookingPrice,
      STATUS: "NotYetPaid", // Giá trị mặc định
      CUSTOMER_PHONE: bookingData.CUSTOMER_PHONE,
      CUSTOMER_NAME: bookingData.CUSTOMER_NAME,
    });

    // Lưu booking vào database
    await booking.save();

    return booking;
  }

  // Cập nhật trạng thái booking
  async updateBookingStatus({ bookingId, status }) {
    // Tìm booking bằng ID
    const booking = await BOOKING_MODEL.findById(bookingId);

    if (!booking) {
      return {
        statusCode: 404,
        msg: "Không tìm thấy đơn đặt phòng",
      };
    }

    // Cập nhật trạng thái của đơn đặt phòng
    booking.STATUS = status;
    await booking.save();

    // Cập nhật trạng thái sản phẩm trong LIST_PRODUCT của đơn đặt phòng
    for (let product of booking.LIST_PRODUCT) {
      await this.updateProductAvailability(
        product.PRODUCT_ID,
        product.QUANTITY
      );
    }

    return {
      statusCode: 200,
      msg: `Trạng thái booking đã được cập nhật thành ${status}`,
      data: booking,
    };
  }

  async updateProductAvailability(productId, quantity) {
    // Tìm sản phẩm bằng ID
    const product = await PRODUCT_MODEL.findById(productId);

    if (!product) {
      return {
        statusCode: 404,
        msg: "Không tìm thấy sản phẩm",
      };
    }

    // Cập nhật số lượng tồn kho của sản phẩm
    if (product.QUANTITY >= quantity) {
      product.QUANTITY -= quantity;
    } else {
      throw new Error("Số lượng sản phẩm không đủ để cập nhật");
    }

    // Lưu lại thay đổi
    await product.save();

    return {
      statusCode: 200,
      msg: "Trạng thái sản phẩm đã được cập nhật",
    };
  }

  // Lấy tất cả các booking của một người dùng
  async getBookingsByUserId(userId) {
    try {
      // Tìm tất cả các booking của người dùng dựa trên USER_ID
      const bookings = await BOOKING_MODEL.find({ USER_ID: userId }).populate({
        path: "LIST_PRODUCT.PRODUCT_ID",
        select: "NAME PRICE IMAGES", // Lấy các trường NAME, PRICE, IMAGES
      });

      if (!bookings || bookings.length === 0) {
        throw new Error("Không tìm thấy booking nào");
      }

      // Lấy hình ảnh đầu tiên từ mảng IMAGES
      const formattedBookings = bookings.map((booking) => {
        booking.LIST_PRODUCT = booking.LIST_PRODUCT.map((product) => {
          product.PRODUCT_ID.IMAGES = product.PRODUCT_ID.IMAGES?.[0] || ""; // Lấy hình ảnh đầu tiên
          return product;
        });
        return booking;
      });

      return formattedBookings;
    } catch (error) {
      console.error("Error in getBookingsByUserId:", error.message);
      throw new Error("Lỗi khi lấy booking của người dùng");
    }
  }
}

module.exports = new BOOKING_SERVICE();
