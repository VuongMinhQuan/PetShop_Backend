const BOOKING_SERVICE = require("../../Service/Booking/Booking.Service");

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
    const { userId, productsDetails } = req.body;

    if (!userId || !productsDetails || productsDetails.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Thiếu userId hoặc danh sách sản phẩm.",
      });
    }

    try {
      // Gọi hàm bookProductNows từ service
      const booking = await BOOKING_SERVICE.bookProductNows(
        userId,
        productsDetails
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
}

module.exports = new BOOKING_CONTROLLER();
