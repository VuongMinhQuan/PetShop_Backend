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
      const { userId } = req;
      const { reviewId } = req.params;
      const { rating, comment } = req.body;

      // Gọi service để cập nhật đánh giá
      const updatedReview = await REVIEW_SERVICE.updateReview(
        reviewId,
        userId,
        rating,
        comment
      );
      return res
        .status(200)
        .json({
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
      const  userId  = req.user_id;
      const { productId, bookingId } = req.body;

      // Gọi service để lấy đánh giá
      const review = await REVIEW_SERVICE.getReviewByUserAndProduct(
        userId,
        productId,
        bookingId
      );
      if (!review) {
        return res
          .status(404)
          .json({ success: false, message: "Không tìm thấy đánh giá" });
      }
      return res.status(200).json({ success: true, data: review });
    } catch (error) {
      return res.status(400).json({ success: false, message: error.message });
    }
  }
}

module.exports = new REVIEW_CONTROLLER();
