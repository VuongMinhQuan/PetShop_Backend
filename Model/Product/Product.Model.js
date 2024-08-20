const mongoose = require("mongoose");
const { Schema } = mongoose;

const productSchema = new Schema(
  {
    NAME: {
      type: String,
      required: true, 
    },
    PRICE: {
      type: Number,
      required: true, 
    },
    DESCRIPTION: {
      type: String,
      required: false, 
    },
    TYPE: {
      type: String,
      required: true, 
    },
    IMAGE: {
      type: [String], 
      required: false, 
    },
    QUANTITY: {
      type: Number,
      required: true, 
    },
    CREATED_AT: {
      type: Date,
      default: Date.now, 
    },
    UPDATE_AT: {
      type: Date,
      default: Date.now, 
    },
    DISCOUNT: {
      type: Number,
      required: false, 
    },
  },
  {
    timestamps: false, 
  }
);

const Product = mongoose.model("Product", productSchema);

module.exports = Product;
