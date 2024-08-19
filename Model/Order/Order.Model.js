const mongoose = require("mongoose");
const { Schema } = mongoose;

const orderSchema = new Schema(
  {
    _id: {
      type: Schema.Types.ObjectId,
      auto: true,
    },
    order_Id: {
      type: Schema.Types.ObjectId,
      required: true,
    },
    USER_ID: {
      type: Schema.Types.ObjectId,
      required: true,
    },
    PRODUCT_ID: {
      type: Schema.Types.ObjectId,
      required: true,
    },
    TOTAL_PRICE: {
      type: Number,
      required: true,
    },
    STATUS: {
      type: String,
      enum: ["WAITING", "ON_DELIVERY", "COMPLETED"],
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
  },
  {
    versionKey: false,
    strict: true,
  }
);

const Order = mongoose.model("Order", orderSchema);

module.exports = Order;
