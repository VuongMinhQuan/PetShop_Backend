const mongoose = require("mongoose");
const { Schema } = mongoose;

const ImageSchema = new Schema(
  {
    path: {
      type: String,
      required: true, // Đường dẫn tới file ảnh trên máy chủ hoặc URL
    },
    description: {
      type: String,
    },
    order: {
      type: Number,
    },
  },
  { _id: false }
);

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
    },
    TYPE: {
      type: String,
      required: true,
    },
    IMAGES: [ImageSchema],
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
