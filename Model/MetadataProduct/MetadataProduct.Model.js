const mongoose = require("mongoose");
const { Schema } = mongoose;

const metadataProductSchema = new Schema(
  {
    _id: {
      type: Schema.Types.ObjectId,
      auto: true,
    },
    PRODUCT_ID: {
      type: String,
      required: true,
    },
    TOTAL_QUANTITY: {
      type: Number,
      required: true,
    },
    TOTAL_REVIEW: {
      type: Number,
      required: true,
    },
    AVERAGE_RATING: {
      type: Number,
      required: true,
    },
  },
  {
    versionKey: false,
    strict: true,
  }
);

const MetadataProduct = mongoose.model(
  "MetadataProduct",
  metadataProductSchema
);

module.exports = MetadataProduct;
