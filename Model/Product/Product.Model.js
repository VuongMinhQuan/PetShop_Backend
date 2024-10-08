const mongoose = require("mongoose");
const { Schema } = mongoose;


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
          'Alaska', 'Husky', 'Golden', 'Bull Pháp', 'Corgi', 'Poodle', 'Pug', 'Samoyed', 'Cat', // for Animals
          'FDog', 'FCat', // for Foods
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
    IMAGES: {
      type: [String],
    },
    QUANTITY: {
      type: Number,
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
