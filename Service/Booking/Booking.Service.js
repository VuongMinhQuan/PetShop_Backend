const { default: axios } = require("axios");
const BOOKING_MODEL = require("../../Model/Booking/Booking.Model");
const CART_MODEL = require("../../Model/Cart/Cart.Model");
const PRODUCT_MODEL = require("../../Model/Product/Product.Model");
const USER_MODEL = require("../../Model/User/User.Model");
const CART_SERVICE = require("../../Service/Cart/Cart.Service");
const MAIL_QUEUE = require("../../Utils/sendMail");

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

  async bookProductNows(userId, productsDetails, paymentMethod) {
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
        NAME: product.NAME,
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
      ProvinceID: productsDetails[0].ProvinceID,
      ProvinceName: productsDetails[0].ProvinceName, // Lấy từ frontend
      DistrictID: productsDetails[0].DistrictID, // Lấy từ frontend
      DistrictName: productsDetails[0].DistrictName, // Lấy từ frontend
      WardCode: productsDetails[0].WardCode, // Lấy từ frontend
      WardName: productsDetails[0].WardName,

      PAYMENT_METHOD: paymentMethod,
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
        msg: "Không tìm thấy đơn đặt hàng",
      };
    }

    const user = await USER_MODEL.findById(booking.USER_ID);
    if (!user || !user.EMAIL)
      throw new Error("Không tìm thấy người dùng hoặc email không tồn tại");

    const previousStatus = booking.STATUS;

    // Cập nhật trạng thái của đơn đặt hàng
    booking.STATUS = status;
    await booking.save();

    // Cập nhật trạng thái sản phẩm trong LIST_PRODUCT của đơn đặt hàng
    if (
      (previousStatus === "NotYetPaid" || previousStatus === "Canceled") &&
      (status === "Paid" || status === "Confirm")
    ) {
      for (let product of booking.LIST_PRODUCT) {
        await this.updateProductAvailability(
          product.PRODUCT_ID,
          product.QUANTITY
        );
      }
    }

    if (status === "Paid" || status === "Confirm") {
      const emailContent = `
      <div style="
        font-family: Arial, sans-serif;
        padding: 20px;
        background-color: #f4f4f4;
        border: 1px solid #ddd;
        border-radius: 8px;
      ">
        <h2 style="
          text-align: center;
          background-color: #3ba8cd;
          color: white;
          padding: 10px 0;
          margin: 0;
          border-radius: 4px;
        ">
          Xin chào ${user.FULLNAME},
        </h2>
        <p style="
          font-size: 16px;
          color: #333;
          margin-top: 20px;
          font-weight: bold;
        ">
          Cảm ơn bạn đã đặt hàng với mã đơn hàng ${bookingId}. Chi tiết đơn hàng như sau:
        </p>
        <ul style="
          padding: 0;
          list-style: none;
          margin: 10px 0 20px 0;
        ">
          <li style="
            background-color: #e8f4f8;
            padding: 10px;
            margin-bottom: 5px;
            border-radius: 4px;
            font-size: 15px;
          ">
            <strong>Tên khách hàng:</strong> ${booking.CUSTOMER_NAME}
          </li>
          <li style="
            padding: 10px;
            margin-bottom: 5px;
            border-radius: 4px;
            font-size: 15px;
          ">
            <strong>Số lượng sản phẩm:</strong> ${booking.LIST_PRODUCT.length}
          </li>
          <li style="
            padding: 10px;
            margin-bottom: 5px;
            border-radius: 4px;
            font-size: 15px;
          ">
            <strong>Tổng tiền:</strong> ${booking.TOTAL_PRICE} VND
          </li>
        </ul>
        <p style="
          font-size: 16px;
          color: #333;
          font-weight: bold;
          text-align: center;
          color: white;
          padding: 10px;
          border-radius: 4px;
        ">
          Cảm ơn bạn đã sử dụng dịch vụ của chúng tôi!
        </p>
      </div>
    `;
      // Đưa email vào hàng đợi
      await MAIL_QUEUE.enqueue({
        email: user.EMAIL,
        otp: "", // Không cần OTP cho xác nhận booking
        otpType: "BookingConfirmation",
        content: emailContent,
      });
    }

    return {
      statusCode: 200,
      msg: `Trạng thái booking đã được cập nhật thành ${status}`,
      data: booking,
    };
  }

  async Shipping({ bookingId, weight, length, width, height, required_note }) {
    let config = require("config");
    const token = config.GHN.Token; // Lấy Token từ cấu hình
    const shopId = config.GHN.ShopId; // Lấy ShopId từ cấu hình
    const url = config.GHN.Url; // Lấy Url từ cấu hình
    const booking = await BOOKING_MODEL.findById(bookingId);

    if (!booking) {
      return {
        statusCode: 404,
        msg: "Không tìm thấy đơn đặt hàng",
      };
    }

    const items = booking.LIST_PRODUCT.map((item) => ({
      name: item.NAME,
      quantity: item.QUANTITY,
      price: item.TOTAL_PRICE_PRODUCT,
    }));

    const ship = {
      to_name: booking.CUSTOMER_NAME,
      to_phone: booking.CUSTOMER_PHONE,
      to_address: booking.CUSTOMER_ADDRESS,
      to_ward_code: booking.WardCode.toString(),
      to_district_id: booking.DistrictID,
      cod_amount: booking.STATUS == "NotYetPaid" ? booking.TOTAL_PRICE : 0,
      weight,
      length,
      width,
      height,
      service_type_id: 2,
      payment_type_id: 1,
      required_note,
      Items: items,
    };

    console.log(ship);

    try {
      const response = await axios.post(url + "/create", ship, {
        headers: {
          Token: token,
          ShopId: shopId,
        },
      });

      console.log("Response from GHN:", response.data);
      return response.data;
    } catch (error) {
      console.error("Error shipping:", error);
      throw error;
    }
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

  async getAllBookings() {
    // Tìm tất cả các booking
    const bookings = await BOOKING_MODEL.find({})
      .populate({
        path: "USER_ID",
        select: "FULLNAME PHONE_NUMBER", // Chỉ lấy các trường FULLNAME và PHONE_NUMBER từ user
      })
      .populate({
        path: "LIST_PRODUCT.PRODUCT_ID",
        select: "NAME", // Chỉ lấy trường NAME từ sản phẩm
      });

    if (!bookings || bookings.length === 0) {
      throw new Error("Không tìm thấy booking nào");
    }

    // Định dạng lại dữ liệu booking để gửi trả về
    return bookings.map((booking) => {
      return {
        bookingId: booking._id, // Thêm bookingId vào kết quả trả về
        USER_INFO: {
          FULLNAME: booking.USER_ID.FULLNAME,
          PHONE_NUMBER: booking.USER_ID.PHONE_NUMBER,
        },
        PRODUCT_LIST: booking.LIST_PRODUCT.map((product) => ({
          NAME: product.PRODUCT_ID.NAME,
          QUANTITY: product.QUANTITY,
          TOTAL_PRICE_PRODUCT: product.TOTAL_PRICE_PRODUCT,
        })),
        CUSTOMER_NAME: booking.CUSTOMER_NAME,
        CUSTOMER_PHONE: booking.CUSTOMER_PHONE,
        TOTAL_PRICE: booking.TOTAL_PRICE,
        STATUS: booking.STATUS,
        PAYMENT_METHOD: booking.PAYMENT_METHOD,
        createdAt: booking.createdAt,
      };
    });
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

  // Trong BOOKING_SERVICE
  async getBookingDetails(bookingId) {
    // Tìm booking bằng ID
    const booking = await BOOKING_MODEL.findById(bookingId)
      .populate({
        path: "USER_ID",
        select: "FULLNAME PHONE_NUMBER", // Lấy tên và số điện thoại của khách hàng
      })
      .populate({
        path: "LIST_PRODUCT.PRODUCT_ID",
        select: "NAME PRICE IMAGES", // Lấy tên, giá và hình ảnh của sản phẩm
      });

    if (!booking) {
      throw new Error("Không tìm thấy đơn đặt phòng");
    }

    return {
      bookingId: booking._id,
      CUSTOMER_NAME: booking.CUSTOMER_NAME,
      CUSTOMER_PHONE: booking.CUSTOMER_PHONE,
      CUSTOMER_ADDRESS: booking.CUSTOMER_ADDRESS,
      ProvinceName: booking.ProvinceName,
      DistrictName: booking.DistrictName,
      WardName: booking.WardName,
      LIST_PRODUCT: booking.LIST_PRODUCT.map((product) => ({
        NAME: product.PRODUCT_ID.NAME,
        PRICE: product.PRODUCT_ID.PRICE,
        IMAGES: product.PRODUCT_ID.IMAGES,
        QUANTITY: product.QUANTITY,
        TOTAL_PRICE_PRODUCT: product.TOTAL_PRICE_PRODUCT,
      })),
      TOTAL_PRICE: booking.TOTAL_PRICE,
      STATUS: booking.STATUS,
      createdAt: booking.createdAt,
    };
  }

  // Thêm hàm getDailyRevenue vào BOOKING_SERVICE
  async getDailyRevenue(date) {
    try {
      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0); // Bắt đầu của ngày

      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999); // Kết thúc của ngày

      const revenueData = await BOOKING_MODEL.aggregate([
        {
          $match: {
            STATUS: "Complete",
            createdAt: { $gte: startOfDay, $lte: endOfDay },
          },
        },
        {
          $group: {
            _id: null,
            totalRevenue: { $sum: "$TOTAL_PRICE" },
            orderCount: { $sum: 1 },
          },
        },
      ]);

      if (revenueData.length === 0) {
        return { totalRevenue: 0, orderCount: 0 };
      }

      return {
        totalRevenue: revenueData[0].totalRevenue,
        orderCount: revenueData[0].orderCount,
      };
    } catch (error) {
      console.error("Error fetching daily revenue:", error);
      throw error;
    }
  }
}

module.exports = new BOOKING_SERVICE();
