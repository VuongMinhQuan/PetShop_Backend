const mongoose = require("mongoose");
const { Schema } = mongoose;

const paymentSchema = new Schema(
  {
    _id: {
      type: Schema.Types.ObjectId,
      auto: true,
    },
    payment_Id: {
      type: Schema.Types.ObjectId,
      required: true,
    },
    ORDER_ID: {
      type: String,
      required: true,
    },
    USER_ID: {
      type: String,
      required: true,
    },
    PAYMENT_METHOD: {
      type: String,
      enum: ["Credit Card", "Paypal", "ZaloPay"],
      required: true,
    },
    STATUS: {
      type: String,
      enum: ["Pending", "Completed", "Failed"],
      required: true,
    },
    AMOUNT: {
      type: Number,
      required: true,
    },
    PAID: {
      type: Number,
      required: true,
    },
    CREATED_AT: {
      type: Date,
      required: true,
      default: Date.now,
    },
    DISCOUNT: {
      type: Number,
    },
  },
  {
    versionKey: false,
    strict: true,
  }
);

const Payment = mongoose.model("Payment", paymentSchema);

module.exports = Payment;
