const express = require("express");
const router = express.Router();
const REVIEW_CONTROLLER = require('../../Controllers/Review/Review.Controller')
const {
  verifyToken,
  verifyTokenAdmin,
} = require("../../Middleware/verifyToken");
router.post("/addReview", verifyToken, REVIEW_CONTROLLER.addReview);
router.get("/getReviewsByProductId/:productId", REVIEW_CONTROLLER.getReviewsByProductId);
router.put(
  "/updateReview/:reviewId",
  verifyToken,
  REVIEW_CONTROLLER.updateReview
);
router.post(
  "/getReviewByUserAndProduct",
  verifyToken,
  REVIEW_CONTROLLER.getReviewByUserAndProduct
);
router.get("/totalReviews", REVIEW_CONTROLLER.getTotalAverageRating);
router.get("/getAllReviews", REVIEW_CONTROLLER.getAllReviews);
router.get(
  "/getAllReviewsWithStatus",
  REVIEW_CONTROLLER.getAllReviewsWithStatus
);

router.patch("/hide/:reviewId", REVIEW_CONTROLLER.hideReview);
router.delete(
  "/deleteReview/:reviewId",
  verifyToken,
  REVIEW_CONTROLLER.deleteReviewByUser
);

module.exports = router;
