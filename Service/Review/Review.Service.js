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
    const review = await REVIEW_MODEL.findOneAndUpdate(
      { _id: reviewId, USER_ID: userId },
      { RATING: rating, COMMENT: comment },
      { new: true }
    );
    if (!review) {
      throw new Error(
        "Không tìm thấy đánh giá hoặc bạn không có quyền chỉnh sửa."
      );
    }
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
}

module.exports = new REVIEW_SERVICE();
