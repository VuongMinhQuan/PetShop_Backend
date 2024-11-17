const WAREHOUSE_MODEL = require("../../Model/Warehouse/Warehouse.Model");
const PRODUCT_MODEL = require("../../Model/Product/Product.Model");
const USER_MODEL = require("../../Model/User/User.Model");

class WAREHOUSE_SERVICE {
  async createWarehouseEntry(userId, warehouseDetails) {
    // Tìm sản phẩm trong CSDL
    const product = await PRODUCT_MODEL.findById(warehouseDetails.productId);

    if (!product) {
      throw new Error("Sản phẩm không tồn tại.");
    }

    // Tính tổng giá trị
    const totalValue = warehouseDetails.quantity * warehouseDetails.unitPrice;

    // Tạo phiếu nhập kho mới
    const warehouseEntry = new WAREHOUSE_MODEL({
      PRODUCT_ID: warehouseDetails.productId,
      USER_ID: userId,
      QUANTITY: warehouseDetails.quantity,
      UNIT_PRICE: warehouseDetails.unitPrice,
      TOTAL_VALUE: totalValue,
      NOTE: warehouseDetails.note,
    });

    // Lưu phiếu nhập vào CSDL
    await warehouseEntry.save();

    // Cập nhật số lượng sản phẩm trong kho
    product.QUANTITY += warehouseDetails.quantity;
    await product.save();

    // Lấy thông tin người nhập
    const user = await USER_MODEL.findById(userId);
    if (!user) {
      throw new Error("Người dùng không tồn tại.");
    }

    // Trả về thông tin chi tiết
    return {
      PRODUCT_NAME: product.NAME,
      USER_NAME: user.FULLNAME,
      QUANTITY_ADDED: warehouseDetails.quantity,
      TOTAL_VALUE: totalValue,
      UPDATED_PRODUCT_QUANTITY: product.QUANTITY,
    };
  }
  async getAllWarehouseEntries(filters, pagination) {
    const { productId, userId, startDate, endDate } = filters;
    const { page = 1, limit = 10 } = pagination;

    const query = {};

    if (productId) query.PRODUCT_ID = productId;
    if (userId) query.USER_ID = userId;
    if (startDate && endDate) {
      query.createdAt = {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      };
    }

    const entries = await WAREHOUSE_MODEL.find(query)
      .populate("PRODUCT_ID", "NAME")
      .populate("USER_ID", "FULLNAME")
      .skip((page - 1) * limit)
      .limit(limit)
      .sort({ createdAt: -1 });

    const total = await WAREHOUSE_MODEL.countDocuments(query);

    return {
      entries,
      total,
      page,
      limit,
    };
  }
  async getWarehouseEntryById(entryId) {
    const entry = await WAREHOUSE_MODEL.findById(entryId)
      .populate("PRODUCT_ID", "NAME")
      .populate("USER_ID", "FULLNAME");

    if (!entry) {
      throw new Error("Phiếu nhập không tồn tại.");
    }

    return entry;
  }
}

module.exports = new WAREHOUSE_SERVICE();
