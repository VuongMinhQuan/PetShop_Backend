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
module.exports = router;
