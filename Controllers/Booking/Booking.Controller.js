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

  async Shipping(req, res) {
    // Lấy dữ liệu từ body của yêu cầu
    const { bookingId, weight, length, width, height, required_note } =
      req.body;

    // Kiểm tra các tham số đầu vào
    if (!bookingId || !weight || !length || !width || !height) {
      return res.status(400).json({
        success: false,
        message: "Thiếu thông tin yêu cầu.",
      });
    }

    try {
      // Gọi dịch vụ Shipping
      const shippingResponse = await BOOKING_SERVICE.Shipping({
        bookingId,
        weight,
        length,
        width,
        height,
        required_note,
      });

      // Trả về kết quả từ dịch vụ
      return res.status(200).json({
        success: true,
        data: shippingResponse,
      });
    } catch (error) {
      console.error("Lỗi khi gọi dịch vụ Shipping:", error);
      return res.status(500).json({
        success: false,
        message: "Có lỗi xảy ra khi thực hiện giao hàng.",
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

  async getMonthlyRevenue(req, res) {
    const { year, month } = req.query;

    // Kiểm tra xem `year` và `month` có được cung cấp hay không
    if (!year || !month) {
      return res.status(400).json({
        success: false,
        message: "Thiếu tham số year hoặc month.",
      });
    }

    try {
      // Gọi hàm từ service để tính doanh thu theo tháng
      const revenue = await BOOKING_SERVICE.getMonthlyRevenue(
        Number(year),
        Number(month)
      );

      // Trả về kết quả nếu thành công
      return res.status(200).json({
        success: true,
        message: "Lấy doanh thu tháng thành công",
        data: { year, month, revenue },
      });
    } catch (error) {
      console.error("Error in getMonthlyRevenue:", error.message);
      return res.status(500).json({
        success: false,
        message: "Lỗi khi lấy doanh thu tháng.",
        error: error.message,
      });
    }
  }

  async getUserTotalSpent(req, res) {
    try {
      const userId = req.user_id; // Lấy `userId` từ token hoặc session
      const totalSpent = await BOOKING_SERVICE.getUserTotalSpent(userId);

      return res.status(200).json({
        success: true,
        message: "Lấy tổng tiền đã chi tiêu thành công.",
        data: { totalSpent },
      });
    } catch (error) {
      console.error("Error in getUserTotalSpent:", error.message);
      return res.status(500).json({
        success: false,
        message: "Lỗi khi lấy tổng tiền đã chi tiêu.",
        error: error.message,
      });
    }
  }
  async getTotalRevenueByYearOrDateRange(req, res) {
    const { year, startDate, endDate } = req.query;

    if (!year && (!startDate || !endDate)) {
      return res.status(400).json({
        success: false,
        message: "Cần nhập năm hoặc khoảng thời gian (startDate và endDate).",
      });
    }

    try {
      // Gọi hàm service để lấy doanh thu
      const revenue = await BOOKING_SERVICE.getTotalRevenueByYearOrDateRange(
        Number(year),
        startDate,
        endDate
      );

      return res.status(200).json({
        success: true,
        message: "Lấy doanh thu thành công.",
        data: revenue,
      });
    } catch (error) {
      console.error(
        "Error in getTotalRevenueByYearOrDateRange:",
        error.message
      );
      return res.status(500).json({
        success: false,
        message: "Lỗi khi lấy doanh thu.",
        error: error.message,
      });
    }
  }
  async getRevenue(req, res) {
    try {
      const { timeFrame, selectedDate, selectedMonth, selectedYear } =
        req.query;

      // Gọi service để lấy dữ liệu doanh thu
      const revenueData = await BOOKING_SERVICE.getRevenue(
        timeFrame,
        selectedDate,
        selectedMonth,
        selectedYear
      );

      // Trả về dữ liệu cho client
      return res.json({ data: revenueData });
    } catch (error) {
      console.error("Lỗi khi lấy dữ liệu doanh thu:", error);
      return res.status(500).json({ error: "Lỗi khi lấy dữ liệu doanh thu" });
    }
  }

  async getBookingStatusData(req, res) {
    try {
      const { timeFrame, selectedYear, selectedMonth, selectedDate } =
        req.query;

      // Gọi service để lấy dữ liệu trạng thái đặt hàng
      const bookingStatusData = await BOOKING_SERVICE.getBookingStatusData(
        timeFrame,
        selectedYear,
        selectedMonth,
        selectedDate
      );

      // Trả về dữ liệu cho client
      return res.json({ data: bookingStatusData });
    } catch (error) {
      console.error("Lỗi khi lấy dữ liệu trạng thái đặt hàng:", error);
      return res
        .status(500)
        .json({ error: "Lỗi khi lấy dữ liệu trạng thái đặt hàng" });
    }
  }
  async getCompleteBookingsCount(req, res) {
    const completeBookingsCount =
      await BOOKING_SERVICE.getCompleteBookingsCount();

    return res.status(200).json({
      success: true,
      message: "Lấy số lượng đơn hàng đã hoàn thành thành công.",
      data: { completeBookingsCount },
    });
  }
  async getMonthlyRevenueComparison(req, res) {
    try {
      const { year, month } = req.query;

      // Kiểm tra tham số đầu vào
      if (!year || !month) {
        return res.status(400).json({
          success: false,
          message: "Thiếu tham số year hoặc month.",
        });
      }

      // Gọi service để lấy doanh thu
      const revenueData = await BOOKING_SERVICE.getMonthlyRevenueComparison(
        Number(year),
        Number(month)
      );

      return res.status(200).json({
        success: true,
        message: "Lấy doanh thu so với tháng trước thành công.",
        data: revenueData,
      });
    } catch (error) {
      console.error("Error in getMonthlyRevenueComparison:", error.message);
      return res.status(500).json({
        success: false,
        message: "Lỗi khi lấy doanh thu so với tháng trước.",
        error: error.message,
      });
    }
  }
}

module.exports = new BOOKING_CONTROLLER();
