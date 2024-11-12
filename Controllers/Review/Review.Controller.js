const REVIEW_SERVICE = require("../../Service/Review/Review.Service");

class REVIEW_CONTROLLER {
  // Thêm đánh giá mới
  async addReview(req, res) {
    try {
      const userId = req.user._id;
      const { bookingId, productId, rating, comment } = req.body;

      // Gọi service để thêm đánh giá
      const review = await REVIEW_SERVICE.addReview(
        userId,
        bookingId,
        productId,
        rating,
        comment
      );
      return res
        .status(201)
        .json({ success: true, message: "Đánh giá thành công", data: review });
    } catch (error) {
      return res.status(400).json({ success: false, message: error.message });
    }
  }

  // Lấy đánh giá theo productId
  async getReviewsByProductId(req, res) {
    try {
      const { productId } = req.params;

      // Gọi service để lấy danh sách đánh giá
      const reviews = await REVIEW_SERVICE.getReviewsByProductId(productId);
      return res.status(200).json({ success: true, data: reviews });
    } catch (error) {
      return res.status(400).json({ success: false, message: error.message });
    }
  }

  // Cập nhật đánh giá
  async updateReview(req, res) {
    try {
      const userId = req.user._id; // Lấy userId từ req.user
      const { reviewId } = req.params;
      const { rating, comment } = req.body;

      // Gọi service để cập nhật đánh giá
      const updatedReview = await REVIEW_SERVICE.updateReview(
        reviewId,
        userId,
        rating,
        comment
      );

      return res.status(200).json({
        success: true,
        message: "Cập nhật đánh giá thành công",
        data: updatedReview,
      });
    } catch (error) {
      return res.status(400).json({ success: false, message: error.message });
    }
  }

  // Lấy đánh giá theo userId và productId
  async getReviewByUserAndProduct(req, res) {
    try {
      const userId = req.user_id;
      const { productId, bookingId } = req.body;

      // Gọi service để lấy đánh giá
      const review = await REVIEW_SERVICE.getReviewByUserAndProduct(
        userId,
        productId,
        bookingId
      );
      if (!review) {
        return res.status(200).json({ success: true, data: null });
      }
      return res.status(200).json({ success: true, data: review });
    } catch (error) {
      return res.status(400).json({ success: false, message: error.message });
    }
  }
  async getTotalAverageRating(req, res) {
    try {
      const averageRating = await REVIEW_SERVICE.getTotalAverageRating();
      return res
        .status(200)
        .json({ success: true, data: { totalAverageRating: averageRating } });
    } catch (error) {
      return res.status(400).json({ success: false, message: error.message });
    }
  }
  async getAllReviews(req, res) {
    try {
      const reviews = await REVIEW_SERVICE.getAllReviews();
      return res.status(200).json({ success: true, data: reviews });
    } catch (error) {
      return res.status(400).json({ success: false, message: error.message });
    }
  }
  async getAllReviewsWithStatus(req, res) {
    try {
      const reviews = await REVIEW_SERVICE.getAllReviewsWithStatus();
      return res.status(200).json({
        success: true,
        data: reviews,
      });
    } catch (error) {
      return res.status(400).json({ success: false, message: error.message });
    }
  }

  async hideReview(req, res) {
    try {
      const { reviewId } = req.params; // Lấy reviewId từ tham số URL

      // Gọi service để chuyển đổi trạng thái đánh giá
      const updatedReview = await REVIEW_SERVICE.toggleReviewStatus(reviewId);
      return res.status(200).json({
        success: true,
        message: "Trạng thái đánh giá đã được cập nhật thành công.",
        data: updatedReview,
      });
    } catch (error) {
      return res.status(400).json({ success: false, message: error.message });
    }
  }
  async deleteReviewByUser(req, res) {
    try {
      const { reviewId } = req.params;
      const userId = req.user._id; // Lấy userId từ token (req.user)

      const deletedReview = await REVIEW_SERVICE.deleteReviewPermanently(
        reviewId,
        userId
      );

      return res.json({
        success: true,
        msg: "Xóa đánh giá thành công",
        review: deletedReview,
      });
    } catch (error) {
      console.error("Lỗi khi xóa đánh giá:", error);
      return res.status(400).json({ success: false, msg: error.message });
    }
  }
}

module.exports = new REVIEW_CONTROLLER();
