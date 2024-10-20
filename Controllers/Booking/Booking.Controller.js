const BOOKING_SERVICE = require("../../Service/Booking/Booking.Service");
const USER_MODEL = require("../../Model/User/User.Model");

class BOOKING_CONTROLLER {
  // Đặt sản phẩm ngay lập tức
  async bookProductNow(req, res) {
    try {
      const userId = req.user_id; // Lấy user ID từ token hoặc session
      const productDetails = req.body;

      const booking = await BOOKING_SERVICE.bookProductNow(
        userId,
        productDetails
      );

      return res.status(201).json({
        success: true,
        message: "Đặt sản phẩm thành công.",
        data: booking,
      });
    } catch (error) {
      console.error("Error in bookProductNow:", error.message);
      return res.status(500).json({
        success: false,
        message: "Lỗi khi đặt sản phẩm.",
        error: error.message,
      });
    }
  }

  // Đặt nhiều sản phẩm cùng một lúc
  async bookProductNows(req, res) {
    const { productsDetails, paymentMethod } = req.body;
    const userId = req.user_id; // Lấy user ID từ token hoặc session

    if (!userId || !productsDetails || productsDetails.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Thiếu userId hoặc danh sách sản phẩm.",
      });
    }

    // Kiểm tra paymentMethod
    if (!paymentMethod || !["COD", "VNPay"].includes(paymentMethod)) {
      return res.status(400).json({
        success: false,
        message: "Phương thức thanh toán không hợp lệ.",
      });
    }

    try {
      // Nếu không có thông tin khách hàng, lấy thông tin từ profile
      let userProfile;
      if (
        !productsDetails[0].CUSTOMER_PHONE ||
        !productsDetails[0].CUSTOMER_NAME ||
        !productsDetails[0].CUSTOMER_ADDRESS
      ) {
        userProfile = await USER_MODEL.findById(userId);

        if (!userProfile) {
          return res.status(404).json({
            success: false,
            message: "Không tìm thấy thông tin người dùng.",
          });
        }

        // Gán thông tin từ profile vào productsDetails nếu thiếu
        productsDetails[0].CUSTOMER_PHONE =
          productsDetails[0].CUSTOMER_PHONE || userProfile.PHONE_NUMBER;
        productsDetails[0].CUSTOMER_NAME =
          productsDetails[0].CUSTOMER_NAME || userProfile.FULLNAME;
        productsDetails[0].CUSTOMER_ADDRESS =
          productsDetails[0].CUSTOMER_ADDRESS || userProfile.ADDRESS;
      }

      // Gọi hàm bookProductNows từ service
      const booking = await BOOKING_SERVICE.bookProductNows(
        userId,
        productsDetails,
        paymentMethod
      );

      return res.status(200).json({
        success: true,
        message: "Đặt sản phẩm thành công.",
        data: booking,
      });
    } catch (error) {
      console.error("Error in bookProductNows:", error.message);
      return res.status(500).json({
        success: false,
        message: "Có lỗi xảy ra khi đặt sản phẩm.",
        error: error.message,
      });
    }
  }

  // Đặt sản phẩm từ giỏ hàng
  async bookFromCart(req, res) {
    try {
      const userId = req.user_id; // Lấy user ID từ token hoặc session
      const bookingData = req.body;

      const booking = await BOOKING_SERVICE.bookFromCart(userId, bookingData);

      return res.status(201).json({
        success: true,
        message: "Đặt sản phẩm từ giỏ hàng thành công.",
        data: booking,
      });
    } catch (error) {
      console.error("Error in bookFromCart:", error.message);
      return res.status(500).json({
        success: false,
        message: "Lỗi khi đặt sản phẩm từ giỏ hàng.",
        error: error.message,
      });
    }
  }

  async updateProductAvailability(req, res) {
    const { productId, quantity } = req.body; // Lấy productId và quantity từ body

    if (!productId || !quantity) {
      return res.status(400).json({
        success: false,
        message: "Thiếu productId hoặc quantity trong yêu cầu.",
      });
    }

    try {
      const response = await BOOKING_SERVICE.updateProductAvailability(
        productId,
        quantity
      );
      return res.status(response.statusCode).json({
        success: true,
        message: response.msg,
      });
    } catch (error) {
      console.error("Error in updateProductAvailability:", error.message);
      return res.status(500).json({
        success: false,
        message: "Lỗi khi cập nhật trạng thái sản phẩm.",
        error: error.message,
      });
    }
  }

  // Cập nhật trạng thái booking
  async updateBookingStatus(req, res) {
    const { bookingId, status } = req.body;

    if (!bookingId || !status) {
      return res.status(400).json({
        success: false,
        message: "Thiếu bookingId hoặc status trong yêu cầu.",
      });
    }

    try {
      const updatedBooking = await BOOKING_SERVICE.updateBookingStatus({
        bookingId,
        status,
      });

      return res.status(200).json({
        success: true,
        message: "Cập nhật trạng thái booking thành công.",
        data: updatedBooking.data,
      });
    } catch (error) {
      console.error("Error in updateBookingStatus:", error.message);
      return res.status(500).json({
        success: false,
        message: "Lỗi khi cập nhật trạng thái booking.",
        error: error.message,
      });
    }
  }

  async getAllBookings(req, res) {
    try {
      const bookings = await BOOKING_SERVICE.getAllBookings();
      return res.status(200).json({
        success: true,
        message: "Lấy danh sách tất cả các booking thành công",
        data: bookings,
      });
    } catch (error) {
      console.error("Error in getAllBookings:", error.message);
      return res.status(500).json({
        success: false,
        message: "Lỗi khi lấy danh sách tất cả các booking",
        error: error.message,
      });
    }
  }

  // Lấy tất cả các booking của một người dùng
  async getBookingsByUserId(req, res) {
    try {
      const userId = req.user_id; // Lấy user ID từ token hoặc session

      const bookings = await BOOKING_SERVICE.getBookingsByUserId(userId);

      return res.status(200).json({
        success: true,
        message: "Lấy danh sách booking thành công.",
        data: bookings,
      });
    } catch (error) {
      console.error("Error in getBookingsByUserId:", error.message);
      return res.status(500).json({
        success: false,
        message: "Lỗi khi lấy danh sách booking.",
        error: error.message,
      });
    }
  }

  async getBookingDetails(req, res) {
    try {
      const bookingId = req.params.id; // Lấy bookingId từ tham số URL
      const bookingDetails = await BOOKING_SERVICE.getBookingDetails(bookingId);

      res.status(200).json({
        success: true,
        data: bookingDetails,
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  }
}

module.exports = new BOOKING_CONTROLLER();
