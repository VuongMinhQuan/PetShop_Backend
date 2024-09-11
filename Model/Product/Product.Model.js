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

const typeSchema = new Schema(
  {
    mainType: {
      type: String,
      enum: ['Animals', 'Foods', 'Products'],
      required: true,
    },
    subTypes: [
      {
        type: String,
        enum: [
          'Dog', 'Cat', 'Bird', 'Hamster', // for Animals
          'FDog', 'FCat', 'FBird', 'FHamster', // for Foods
          'Toy', 'Bag', 'Cage' // for Products
        ],
        required: true,
      },
    ],
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
      type: typeSchema, // Sử dụng trực tiếp Type Schema
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
    IS_DELETED: {
      type: Boolean,
      required: false,
    },
  },
  {
    timestamps: true,
  }
);

const Product = mongoose.model("Product", productSchema);

module.exports = Product;
