const mongoose = require("mongoose");
const { Schema } = mongoose;

const warehouseSchema = new Schema(
  {
    PRODUCT_ID: {
      type: Schema.Types.ObjectId,
      ref: "Product", // Tham chiếu đến model Product
      required: true,
    },
    USER_ID: {
      type: Schema.Types.ObjectId,
      ref: "User", // Tham chiếu đến model User
      required: true, // Bắt buộc phải có người nhập phiếu
    },
    QUANTITY: {
      type: Number,
      required: true,
    },
    UNIT_PRICE: {
      type: Number,
      required: true,
    },
    TOTAL_VALUE: {
      type: Number,
      required: true,
    },
    NOTE: {
      type: String,
    },
  },
  {
    timestamps: true, // Tự động thêm createdAt và updatedAt
  }
);

warehouseSchema.pre("save", function (next) {
  this.TOTAL_VALUE = this.QUANTITY * this.UNIT_PRICE;
  next();
});

const Warehouse = mongoose.model("Warehouse", warehouseSchema);

module.exports = Warehouse;
