const mongoose = require("mongoose");
const { Schema } = mongoose;

const cartSchema = new Schema(
  {
    USER_ID: {
      type: Schema.Types.ObjectId,
      required: true,
    },
    LIST_PRODUCT: {
      PRODUCT_ID: {
        type: Schema.Types.ObjectId,
        required: true,
      },
      QUANTITY: {
        type: Number,
        required: true,
      },
    },
    TOTAL_PRICE: {
      type: Number,
    },
    CREATED_AT: {
      type: Date,
      required: true,
      default: Date.now,
    },
  },
);

const Cart = mongoose.model("Cart", cartSchema);

module.exports = Cart;
