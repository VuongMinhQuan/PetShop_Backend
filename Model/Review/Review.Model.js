const mongoose = require("mongoose");
const { Schema } = mongoose;

const reviewSchema = new Schema(
  {
    _id: {
      type: Schema.Types.ObjectId,
      auto: true,
    },
    review_Id: {
      type: Schema.Types.ObjectId,
      required: true,
    },
    USER_ID: {
      type: Schema.Types.ObjectId,
      required: true,
    },
    PRODUCT_ID: {
      type: String,
      required: true,
    },
    RATING: {
      type: Number,
    },
    COMMENT: {
      type: String,
    },
    STATUS: {
      type: Boolean,
      required: true,
    },
    CREATED_AT: {
      type: Date,
      required: true,
      default: Date.now,
    },
    UPDATE_AT: {
      type: Date,
      required: true,
      default: Date.now,
    },
    ORDER_ID: {
      type: Schema.Types.ObjectId,
      required: true,
    },
  },
  {
    versionKey: false,
    strict: true,
  }
);

const Review = mongoose.model("Review", reviewSchema);

module.exports = Review;
