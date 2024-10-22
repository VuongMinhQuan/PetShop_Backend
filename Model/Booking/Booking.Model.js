const { required } = require("joi");
const mongoose = require("mongoose");
const { Schema } = mongoose;

const BookingSchema = new Schema(
  {
    USER_ID: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
    LIST_PRODUCT: [
      {
        PRODUCT_ID: {
          type: Schema.Types.ObjectId,
          required: true,
          ref: "Product",
        },
        NAME: {
          type: String,
          required: true,
        },
        QUANTITY: {
          type: Number,
          required: true,
        },
        TOTAL_PRICE_PRODUCT: {
          type: Number,
          required: true,
        },
      },
    ],
    TOTAL_PRICE: {
      type: Number,
      required: true,
    },
    STATUS: {
      type: String,
      enum: ["NotYetPaid", "Confirm",  "Paid", "Shipping", "Complete", "Canceled"],
    },
    CUSTOMER_PHONE: {
      type: String,
      required: true,
    },
    CUSTOMER_NAME: {
      type: String,
      required: true,
    },
    CUSTOMER_ADDRESS: {
      type: String,
      required: true,
    },
    ProvinceID: {
      type: Number,
      required: true,
    },
    ProvinceName: {
      type: String,
      required: true,
    },
    DistrictID: {
      type: Number,
      required: true,
    },
    DistrictName: {
      type: String,
      required: true,
    },
    WardCode: {
      type: Number,
      required: true,
    },
    WardName: {
      type: String,
      required: true,
    },
    PAYMENT_METHOD: {
      type: String,
      enum: ["COD", "VNPay"],
      required: true,
    },
  },
  {
    versionKey: false,
    timestamps: true,
  }
);

const Booking = mongoose.model('Booking', BookingSchema);

module.exports = Booking;