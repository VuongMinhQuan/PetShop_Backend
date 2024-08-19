const mongoose = require("mongoose");
const { Schema } = mongoose;

const metadataUserSchema = new Schema(
  {
    USER_ID: {
      type: Schema.Types.ObjectId,
      required: true, 
    },
    TOTAL_ORDER: {
      type: Number,
      required: true, 
    },
    TOTAL_CANCELLATIONS: {
      type: String,
      required: false, 
    },
  },
  {
    timestamps: true, // Thêm trường createdAt và updatedAt
    versionKey: false,
  }
);

const MetadataUser = mongoose.model("MetadataUser", metadataUserSchema);

module.exports = MetadataUser;
