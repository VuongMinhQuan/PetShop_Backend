const mongoose = require("mongoose");
const { Schema } = mongoose;

const warehouseProductSchema = new Schema(
  {
    PRODUCT_ID: {
      type: Schema.Types.ObjectId,
      ref: "Product", // Tham chiếu đến model Product
      required: true,
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
  },
  {
    _id: false, // Không cần _id riêng cho mỗi sản phẩm
  }
);

const warehouseSchema = new Schema(
  {
    USER_ID: {
      type: Schema.Types.ObjectId,
      ref: "User", // Tham chiếu đến model User
      required: true, // Bắt buộc phải có người nhập phiếu
    },
    PRODUCTS: {
      type: [warehouseProductSchema], // Danh sách các sản phẩm trong phiếu nhập
      required: true,
    },
    NOTE: {
      type: String,
    },
    TOTAL_VALUE: {
      type: Number,
      required: true,
    },
  },
  {
    timestamps: true, // Tự động thêm createdAt và updatedAt
  }
);

// Middleware để tính tổng giá trị phiếu nhập
warehouseSchema.pre("save", function (next) {
  this.TOTAL_VALUE = this.PRODUCTS.reduce((acc, product) => {
    return acc + product.QUANTITY * product.UNIT_PRICE;
  }, 0);
  next();
});

const Warehouse = mongoose.model("Warehouse", warehouseSchema);

module.exports = Warehouse;
