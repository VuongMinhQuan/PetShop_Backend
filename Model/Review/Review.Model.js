const mongoose = require("mongoose");
const { Schema } = mongoose;

const ReviewSchema = new Schema(
  {
    USER_ID: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    BOOKING_ID: {
      type: Schema.Types.ObjectId,
      ref: "Booking",
      required: true,
    },
    PRODUCT_ID: {
      type: String,
      required: true,
    },
    RATING: {
      type: Number,
      min: 1,
      max: 5,
      required: true,
    },
    COMMENT: {
      type: String,
    },
    STATUS: {
      type: Boolean,
      required: true,
    }
  },
  {
    versionKey: false,
    strict: true,
    timestamps: true
  }
);

const Review = mongoose.model("Review", ReviewSchema);

module.exports = Review;
