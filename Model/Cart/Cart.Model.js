const { required } = require("joi");
const mongoose = require("mongoose");
const { Schema } = mongoose;

const cartSchema = new Schema(
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
      },
      QUANTITY: {
        type: Number,
        required: true,
      },
    }, 
  ],  
  },
    {
    timestamps: true, // Optional: to add createdAt and updatedAt fields automatically
    versionKey: false, // Optional: to remove the __v field
  },
);

const Cart = mongoose.model("Cart", cartSchema);

module.exports = Cart;
