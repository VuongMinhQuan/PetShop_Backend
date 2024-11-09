const REVIEW_MODEL = require("../../Model/Review/Review.Model");
const BOOKING_MODEL = require("../../Model/Booking/Booking.Model");
const mongoose = require("mongoose");

class REVIEW_SERVICE {
  async addReview(userId, bookingId, productId, rating, comment) {
    // Kiểm tra xem booking có tồn tại với userId không
    const booking = await BOOKING_MODEL.findOne({
      _id: bookingId,
      USER_ID: userId,
    });

    if (!booking) {
      throw new Error("Không tìm thấy đơn đặt hàng");
    }
    // Kiểm tra sản phẩm có trong đơn đặt hàng không
    const productInBooking = booking.LIST_PRODUCT.find(
      (product) => product.PRODUCT_ID.toString() === productId
    );
    if (!productInBooking) {
      throw new Error("Sản phẩm không tồn tại trong đơn đặt hàng");
    }

    // Kiểm tra xem đã có đánh giá cho sản phẩm này chưa
    const existingReview = await REVIEW_MODEL.findOne({
      BOOKING_ID: bookingId,
      PRODUCT_ID: productId,
      USER_ID: userId,
    });
    if (existingReview) {
      throw new Error("Bạn đã đánh giá sản phẩm này rồi");
    }

    // Tạo và lưu đánh giá mới
    const newReview = new REVIEW_MODEL({
      USER_ID: userId,
      BOOKING_ID: bookingId,
      PRODUCT_ID: productId,
      RATING: rating,
      COMMENT: comment,
      STATUS: true, // Đánh giá được kích hoạt
    });
    await newReview.save();
    return newReview;
  }

  async getReviewsByProductId(productId) {
    const reviews = await REVIEW_MODEL.find({ PRODUCT_ID: productId }).populate(
      {
        path: "USER_ID",
        select: "FULLNAME",
      }
    );
    return reviews;
  }

  async updateReview(reviewId, userId, rating, comment) {
    // Kiểm tra xem đánh giá có tồn tại và thuộc về người dùng hay không
    const review = await REVIEW_MODEL.findOne({
      _id: reviewId,
      USER_ID: userId,
    });
    if (!review) {
      throw new Error(
        "Không tìm thấy đánh giá hoặc bạn không có quyền chỉnh sửa."
      );
    }

    // Cập nhật rating và comment mới
    review.RATING = rating;
    review.COMMENT = comment;

    // Lưu lại đánh giá sau khi chỉnh sửa
    await review.save();

    return review;
  }

  async getReviewByUserAndProduct(userId, productId, bookingId) {
    const review = await REVIEW_MODEL.findOne({
      USER_ID: userId,
      PRODUCT_ID: productId,
      BOOKING_ID: bookingId,
    });
    return review;
  }

  async getTotalAverageRating() {
    const result = await REVIEW_MODEL.aggregate([
      {
        $group: {
          _id: null,
          averageRating: { $avg: "$RATING" },
        },
      },
    ]);

    // Trả về trung bình rating nếu có kết quả, nếu không trả về 0
    return result.length > 0 ? result[0].averageRating : 0;
  }

  async getAllReviews() {
    const reviews = await REVIEW_MODEL.find({ STATUS: true })
      .populate({
        path: "USER_ID",
        select: "FULLNAME",
      })
      .populate({
        path: "PRODUCT_ID",
        select: "NAME IMAGES", // Lấy cả NAME và IMAGES của sản phẩm
      })
      .select("RATING COMMENT createdAt"); // Lấy thêm trường createdAt để hiển thị ngày đánh giá

    // Định dạng kết quả để trả về các thông tin cần thiết
    return reviews.map((review) => ({
      userName: review.USER_ID?.FULLNAME || "Unknown User",
      productName: review.PRODUCT_ID?.NAME || "Unknown Product",
      productImage: review.PRODUCT_ID?.IMAGES?.[0] || "", // Lấy ảnh đầu tiên nếu có
      rating: review.RATING,
      comment: review.COMMENT,
      reviewDate: review.createdAt, // Ngày đánh giá
    }));
  }

  async getAllReviewsWithStatus() {
    const reviews = await REVIEW_MODEL.find()
      .populate({
        path: "USER_ID",
        select: "FULLNAME",
      })
      .populate({
        path: "PRODUCT_ID",
        select: "NAME IMAGES", // Lấy cả NAME và IMAGES của sản phẩm
      })
      .select("RATING COMMENT STATUS createdAt")
      .select("_id RATING COMMENT STATUS createdAt");

    // Định dạng kết quả để trả về các thông tin cần thiết
    return reviews.map((review) => ({
      _id: review._id,
      userName: review.USER_ID?.FULLNAME || "Unknown User",
      productName: review.PRODUCT_ID?.NAME || "Unknown Product",
      productImage: review.PRODUCT_ID?.IMAGES?.[0] || "", // Lấy ảnh đầu tiên nếu có
      rating: review.RATING,
      comment: review.COMMENT,
      status: review.STATUS, // Trả về trạng thái
      reviewDate: review.createdAt, // Ngày đánh giá
    }));
  }

  async toggleReviewStatus(reviewId) {
    // Tìm kiếm đánh giá theo reviewId
    const review = await REVIEW_MODEL.findById(reviewId);
    if (!review) {
      throw new Error("Không tìm thấy đánh giá.");
    }

    // Cập nhật trạng thái của đánh giá
    review.STATUS = !review.STATUS; // Đảo ngược giá trị STATUS
    await review.save();

    return review;
  }
  async deleteReviewPermanently(reviewId, userId) {
    const review = await REVIEW_MODEL.findOneAndDelete({
      _id: reviewId,
      USER_ID: userId,
    });

    if (!review) {
      throw new Error("Không tìm thấy đánh giá hoặc bạn không có quyền xóa.");
    }

    return review;
  }
}

module.exports = new REVIEW_SERVICE();
