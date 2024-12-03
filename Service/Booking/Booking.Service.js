const { default: axios } = require("axios");
const BOOKING_MODEL = require("../../Model/Booking/Booking.Model");
const CART_MODEL = require("../../Model/Cart/Cart.Model");
const PRODUCT_MODEL = require("../../Model/Product/Product.Model");
const USER_MODEL = require("../../Model/User/User.Model");
const CART_SERVICE = require("../../Service/Cart/Cart.Service");
const MAIL_QUEUE = require("../../Utils/sendMail");
const mongoose = require("mongoose");


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
     let bookingStatus = "NotYetPaid";
     if (paymentMethod === "VNPay") {
       // Nếu phương thức thanh toán là VNPay, đặt trạng thái là "Canceled"
       bookingStatus = "Canceled";
     }
    // Tạo booking mới với danh sách sản phẩm và lấy thông tin người dùng nếu thiếu
    const booking = new BOOKING_MODEL({
      USER_ID: userId,
      LIST_PRODUCT: listProducts, // Danh sách các sản phẩm đã đặt
      TOTAL_PRICE: totalPrice, // Tổng giá cho tất cả các sản phẩm
      STATUS: bookingStatus, // Trạng thái booking ban đầu
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
      throw new Error("Không tìm thấy đơn đặt hàng");
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

  async getMonthlyRevenue(year, month) {
    const startOfMonth = new Date(year, month - 1, 1);
    const endOfMonth = new Date(year, month, 0);

    const completedBookings = await BOOKING_MODEL.aggregate([
      {
        $match: {
          STATUS: "Complete",
          createdAt: {
            $gte: startOfMonth,
            $lt: endOfMonth,
          },
        },
      },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: "$TOTAL_PRICE" },
        },
      },
    ]);

    return completedBookings[0]?.totalRevenue || 0;
  }

  async getUserTotalSpent(userId) {
    const result = await BOOKING_MODEL.aggregate([
      {
        $match: {
          USER_ID: new mongoose.Types.ObjectId(userId), // Sử dụng 'new' với ObjectId
          STATUS: { $in: ["Paid", "Complete"] }, // Chỉ lấy các đơn hàng Paid và Complete
        },
      },
      {
        $group: {
          _id: null,
          totalSpent: { $sum: "$TOTAL_PRICE" }, // Tính tổng TOTAL_PRICE
        },
      },
    ]);

    return result[0]?.totalSpent || 0;
  }

  async getTotalRevenueByYearOrDateRange(year, startDate, endDate) {
    if (year) {
      // Tính doanh thu cho từng tháng trong năm đó
      const revenueByMonth = await BOOKING_MODEL.aggregate([
        {
          $match: {
            STATUS: { $in: ["Complete", "Paid"] },
            createdAt: {
              $gte: new Date(year, 0, 1),
              $lt: new Date(year, 11, 31, 23, 59, 59),
            },
          },
        },
        {
          $group: {
            _id: { month: { $month: "$createdAt" } },
            totalRevenue: { $sum: "$TOTAL_PRICE" },
          },
        },
        {
          $match: { totalRevenue: { $gt: 0 } }, // Chỉ lấy những tháng có doanh thu > 0
        },
        {
          $sort: { "_id.month": 1 }, // Sắp xếp theo tháng tăng dần
        },
      ]);

      return { monthlyRevenue: revenueByMonth };
    } else if (startDate && endDate) {
      const revenueByDay = await BOOKING_MODEL.aggregate([
        {
          $match: {
            STATUS: { $in: ["Complete", "Paid"] },
            createdAt: {
              $gte: new Date(startDate),
              $lte: new Date(
                new Date(endDate).setDate(new Date(endDate).getDate() + 1)
              ),
            },
          },
        },
        {
          $group: {
            _id: {
              year: { $year: "$createdAt" },
              month: { $month: "$createdAt" },
              day: { $dayOfMonth: "$createdAt" },
            },
            totalRevenue: { $sum: "$TOTAL_PRICE" },
          },
        },
        {
          $match: { totalRevenue: { $gt: 0 } }, // Chỉ lấy những ngày có doanh thu > 0
        },
        {
          $sort: { "_id.year": 1, "_id.month": 1, "_id.day": 1 },
        },
      ]);

      return { dailyRevenue: revenueByDay };
    } else {
      throw new Error(
        "Cần nhập năm hoặc khoảng thời gian (startDate và endDate)"
      );
    }
  }

  async getRevenue(timeFrame, selectedDate, selectedMonth, selectedYear) {
    const matchStage = {};
    console.log("Selected Year:", selectedYear);
    console.log("Selected Month:", selectedMonth);
    console.log("Selected Date:", selectedDate);

    // Xác định điều kiện lọc dựa trên khung thời gian
    if (timeFrame === "day" && selectedYear && selectedMonth && selectedDate) {
      matchStage.updatedAt = {
        $gte: new Date(
          `${selectedYear}-${selectedMonth}-${selectedDate}T00:00:00.000Z`
        ),
        $lt: new Date(
          `${selectedYear}-${selectedMonth}-${selectedDate}T23:59:59.999Z`
        ),
      };
    } else if (timeFrame === "month" && selectedYear && selectedMonth) {
      matchStage.updatedAt = {
        $gte: new Date(`${selectedYear}-${selectedMonth}-01T00:00:00.000Z`),
        $lt: new Date(`${selectedYear}-${selectedMonth}-31T23:59:59.999Z`),
      };
    } else if (timeFrame === "year" && selectedYear) {
      matchStage.updatedAt = {
        $gte: new Date(`${selectedYear}-01-01T00:00:00.000Z`),
        $lt: new Date(`${selectedYear}-12-31T23:59:59.999Z`),
      };
    }

    // Pipeline để tính toán doanh thu
    const revenueData = await BOOKING_MODEL.aggregate([
      { $match: matchStage },
      {
        $project: {
          updatedAt: 1,
          month: { $month: "$updatedAt" },
          year: { $year: "$updatedAt" },
          totalRevenue: {
            $cond: {
              if: { $in: ["$STATUS", ["Paid", "Complete"]] },
              then: "$TOTAL_PRICE",
              else: 0,
            },
          },
        },
      },
      {
        $group: {
          _id:
            timeFrame === "day"
              ? {
                  day: { $dayOfMonth: "$updatedAt" },
                  month: "$month",
                  year: "$year",
                }
              : timeFrame === "month"
              ? { month: "$month", year: "$year" }
              : { year: "$year" },
          totalRevenue: { $sum: "$totalRevenue" },
        },
      },
      {
        $sort: { "_id.year": 1, "_id.month": 1, "_id.day": 1 },
      },
    ]);

    // Xử lý dữ liệu trả về
    let formattedData;
    if (timeFrame === "month" && selectedYear && !selectedMonth) {
      // Nếu không có selectedMonth, trả về 12 tháng
      const months = Array.from({ length: 12 }, (_, i) => i + 1);
      const monthlyData = months.map((month) => {
        const entry = revenueData.find((data) => data._id.month === month) || {
          _id: { month, year: selectedYear },
          totalRevenue: 0,
        };
        return {
          date: `${entry._id.year}-${entry._id.month}`,
          revenue: entry.totalRevenue,
        };
      });
      formattedData = monthlyData;
    } else {
      // Chỉ trả về tháng đã chọn
      formattedData = revenueData
        .map((entry) => ({
          date:
            timeFrame === "day"
              ? `${entry._id.year}-${entry._id.month}-${entry._id.day}`
              : timeFrame === "month"
              ? `${entry._id.year}-${entry._id.month}`
              : `${entry._id.year}`,
          revenue: entry.totalRevenue,
        }))
        .filter((entry) => entry.revenue > 0);
    }

    return { revenueData: formattedData };
  }

  async getBookingStatusData(
    timeFrame,
    selectedYear,
    selectedMonth,
    selectedDate
  ) {
    const matchStage = {
      STATUS: { $in: ["Complete", "Canceled"] },
    };

    // Xác định điều kiện lọc theo khung thời gian, sử dụng updatedAt
    if (timeFrame === "day" && selectedYear && selectedMonth && selectedDate) {
      matchStage.updatedAt = {
        $gte: new Date(
          `${selectedYear}-${selectedMonth}-${selectedDate}T00:00:00.000Z`
        ),
        $lt: new Date(
          `${selectedYear}-${selectedMonth}-${selectedDate}T23:59:59.999Z`
        ),
      };
    } else if (timeFrame === "month" && selectedYear && selectedMonth) {
      matchStage.updatedAt = {
        $gte: new Date(`${selectedYear}-${selectedMonth}-01T00:00:00.000Z`),
        $lt: new Date(`${selectedYear}-${selectedMonth}-31T23:59:59.999Z`),
      };
    } else if (timeFrame === "year" && selectedYear) {
      matchStage.updatedAt = {
        $gte: new Date(`${selectedYear}-01-01T00:00:00.000Z`),
        $lt: new Date(`${selectedYear}-12-31T23:59:59.999Z`),
      };
    }

    // Thực hiện pipeline để lấy dữ liệu trạng thái đặt hàng
    const bookingStatusData = await BOOKING_MODEL.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: {
            status: "$STATUS",
            date:
              timeFrame === "day"
                ? { $dateToString: { format: "%Y-%m-%d", date: "$updatedAt" } }
                : timeFrame === "month"
                ? { $dateToString: { format: "%Y-%m", date: "$updatedAt" } }
                : { $year: "$updatedAt" },
          },
          count: { $sum: 1 },
        },
      },
      {
        $group: {
          _id: "$_id.date",
          successfulCount: {
            $sum: {
              $cond: [{ $eq: ["$_id.status", "Complete"] }, "$count", 0],
            },
          },
          canceledCount: {
            $sum: {
              $cond: [{ $eq: ["$_id.status", "Canceled"] }, "$count", 0],
            },
          },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    // Định dạng dữ liệu để trả về
    const formattedData = bookingStatusData.map((entry) => ({
      date: entry._id,
      successfulCount: entry.successfulCount,
      canceledCount: entry.canceledCount,
    }));

    return { bookingStatusData: formattedData };
  }

  async getCompleteBookingsCount() {
    return await BOOKING_MODEL.countDocuments({ STATUS: "Complete" });
  }
  async getMonthlyRevenueComparison(year, month) {
    const currentMonthRevenue = await this.getMonthlyRevenue(year, month); // Doanh thu tháng hiện tại
    const lastMonth = month === 1 ? 12 : month - 1; // Tháng trước
    const lastMonthYear = month === 1 ? year - 1 : year; // Năm trước nếu tháng là tháng 1
    const lastMonthRevenue = await this.getMonthlyRevenue(
      lastMonthYear,
      lastMonth
    ); // Doanh thu tháng trước

    // Tính tỷ lệ thay đổi
    const changePercentage =
      lastMonthRevenue > 0
        ? (
            ((currentMonthRevenue - lastMonthRevenue) / lastMonthRevenue) *
            100
          ).toFixed(2)
        : 0;

    return {
      currentMonthRevenue,
      lastMonthRevenue,
      changePercentage,
    };
  }
  async getTopSellingProducts(limit = 5) {
    try {
      const topProducts = await BOOKING_MODEL.aggregate([
        {
          $match: {
            STATUS: "Complete", // Chỉ lấy các booking có trạng thái "Complete"
          },
        },
        {
          $unwind: "$LIST_PRODUCT", // Tách từng sản phẩm trong danh sách LIST_PRODUCT
        },
        {
          $group: {
            _id: "$LIST_PRODUCT.PRODUCT_ID", // Nhóm theo ID sản phẩm
            totalQuantity: { $sum: "$LIST_PRODUCT.QUANTITY" }, // Tính tổng số lượng bán ra của từng sản phẩm
            totalRevenue: { $sum: "$LIST_PRODUCT.TOTAL_PRICE_PRODUCT" }, // Tính tổng doanh thu từ sản phẩm
          },
        },
        {
          $lookup: {
            from: "products", // Tên collection sản phẩm trong cơ sở dữ liệu
            localField: "_id", // ID sản phẩm trong group
            foreignField: "_id", // ID sản phẩm trong collection products
            as: "productDetails", // Đặt tên cho dữ liệu liên kết
          },
        },
        {
          $unwind: "$productDetails", // Giải nén mảng productDetails để lấy thông tin chi tiết sản phẩm
        },
        {
          $project: {
            _id: 1,
            productName: "$productDetails.NAME", // Lấy tên sản phẩm
            totalQuantity: 1, // Số lượng bán ra
            totalRevenue: 1, // Doanh thu từ sản phẩm
            images: "$productDetails.IMAGES", // Lấy hình ảnh của sản phẩm
          },
        },
        {
          $sort: { totalQuantity: -1 }, // Sắp xếp theo số lượng bán ra giảm dần
        },
        {
          $limit: limit, // Giới hạn số sản phẩm trả về
        },
      ]);

      return topProducts; // Trả về danh sách các sản phẩm bán chạy nhất
    } catch (error) {
      console.error("Lỗi khi lấy sản phẩm bán chạy nhất:", error.message);
      throw new Error("Không thể lấy danh sách sản phẩm bán chạy nhất.");
    }
  }
  async getLastBookingAddress(userId) {
    // Tìm đơn hàng gần nhất với trạng thái "Hoàn thành" hoặc "Đã thanh toán"
    const lastBooking = await BOOKING_MODEL.findOne({
      USER_ID: userId,
      STATUS: { $in: ["Complete", "Paid"] }, // Trạng thái đã thanh toán hoặc hoàn thành
    }).sort({ updatedAt: -1 }); // Sắp xếp theo thời gian cập nhật gần nhất

    if (!lastBooking) {
      throw new Error("Không tìm thấy đơn hàng gần nhất.");
    }

    // Trả về thông tin địa chỉ giao hàng
    return {
      CUSTOMER_NAME: lastBooking.CUSTOMER_NAME,
      CUSTOMER_PHONE: lastBooking.CUSTOMER_PHONE,
      CUSTOMER_ADDRESS: lastBooking.CUSTOMER_ADDRESS,
      ProvinceID: lastBooking.ProvinceID,
      ProvinceName: lastBooking.ProvinceName,
      DistrictID: lastBooking.DistrictID,
      DistrictName: lastBooking.DistrictName,
      WardCode: lastBooking.WardCode,
      WardName: lastBooking.WardName,
    };
  }
}

module.exports = new BOOKING_SERVICE();
