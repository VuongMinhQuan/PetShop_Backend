const mongoose = require("mongoose");
const { Schema } = mongoose;

const MetadataProductSchema = new Schema(
  {
    PRODUCT_ID: {
      type: Schema.Types.ObjectId,
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
  MetadataProductSchema
);

module.exports = MetadataProduct;
