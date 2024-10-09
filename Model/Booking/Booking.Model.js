const { required } = require("joi");
const mongoose = require("mongoose");
const { Schema } = mongoose;

const BookingSchema = new Schema({
  USER_ID: {
    type: Schema.Types.ObjectId,
    required: true,
  },
  LIST_PRODUCT: [
    {
      PRODUCT_ID: {
        type: Schema.Types.ObjectId,
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
    enum: ["NotYetPaid", "Paid", "Canceled"],
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
  },
}, 
  {
  versionKey: false,
  timestamps: true,
});

const Booking = mongoose.model('Booking', BookingSchema);

module.exports = Booking;