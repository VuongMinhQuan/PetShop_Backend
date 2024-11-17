const WAREHOUSE_MODEL = require("../../Model/Warehouse/Warehouse.Model");
const PRODUCT_MODEL = require("../../Model/Product/Product.Model");
const USER_MODEL = require("../../Model/User/User.Model");

class WAREHOUSE_SERVICE {
  async createWarehouseEntry(userId, products, note) {
    const productUpdates = [];

    // Tạo danh sách sản phẩm nhập
    const productDetails = await Promise.all(
      products.map(async (product) => {
        const productData = await PRODUCT_MODEL.findById(product.PRODUCT_ID);

        if (!productData) {
          throw new Error(
            `Sản phẩm với ID ${product.PRODUCT_ID} không tồn tại.`
          );
        }

        const totalValue = product.QUANTITY * product.UNIT_PRICE;

        // Cập nhật số lượng sản phẩm
        productData.QUANTITY += product.QUANTITY;
        await productData.save();

        // Lưu thông tin cập nhật
        productUpdates.push({
          PRODUCT_NAME: productData.NAME,
          QUANTITY_ADDED: product.QUANTITY,
          UPDATED_PRODUCT_QUANTITY: productData.QUANTITY,
        });

        return {
          PRODUCT_ID: product.PRODUCT_ID,
          QUANTITY: product.QUANTITY,
          UNIT_PRICE: product.UNIT_PRICE,
          TOTAL_VALUE: totalValue,
        };
      })
    );

    // Tính tổng giá trị của phiếu nhập
    const totalValue = productDetails.reduce(
      (acc, product) => acc + product.TOTAL_VALUE,
      0
    );

    // Tạo phiếu nhập kho
    const warehouseEntry = new WAREHOUSE_MODEL({
      USER_ID: userId,
      PRODUCTS: productDetails,
      NOTE: note,
      TOTAL_VALUE: totalValue,
    });

    // Lưu phiếu nhập
    await warehouseEntry.save();

    // Lấy thông tin người dùng
    const user = await USER_MODEL.findById(userId);
    if (!user) {
      throw new Error("Người dùng không tồn tại.");
    }
    return {
      USER_NAME: user.FULLNAME,
      TOTAL_VALUE: totalValue,
      PRODUCT_UPDATES: productUpdates,
    };
  }
  async getAllWarehouseEntries(filters, pagination) {
    const { productId, userId, startDate, endDate } = filters;
    const { page = 1, limit = 10 } = pagination;

    const query = {};

    if (userId) query.USER_ID = userId;
    if (startDate && endDate) {
      query.createdAt = {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      };
    }

    const entries = await WAREHOUSE_MODEL.find(query)
      .populate({
        path: "PRODUCTS.PRODUCT_ID",
        select: "NAME PRICE",
      })
      .populate("USER_ID", "FULLNAME")
      .skip((page - 1) * limit)
      .limit(limit)
      .sort({ createdAt: -1 });

    const total = await WAREHOUSE_MODEL.countDocuments(query);

    // Lọc phiếu nhập theo sản phẩm nếu có `productId`
    let filteredEntries = entries;
    if (productId) {
      filteredEntries = entries.filter((entry) =>
        entry.PRODUCTS.some(
          (product) =>
            product.PRODUCT_ID &&
            product.PRODUCT_ID._id.toString() === productId
        )
      );
    }

    return {
      entries: filteredEntries,
      total: filteredEntries.length,
      page,
      limit,
    };
  }
  async getWarehouseEntryById(entryId) {
    // Tìm phiếu nhập kho theo ID
    const entry = await WAREHOUSE_MODEL.findById(entryId)
      .populate({
        path: "PRODUCTS.PRODUCT_ID",
        select: "NAME PRICE", // Lấy tên và giá sản phẩm
      })
      .populate("USER_ID", "FULLNAME"); // Lấy thông tin người nhập

    if (!entry) {
      throw new Error("Phiếu nhập không tồn tại.");
    }

    // Trả về chi tiết phiếu nhập
    return {
      _id: entry._id,
      USER_NAME: entry.USER_ID.FULLNAME || "N/A",
      PRODUCTS: entry.PRODUCTS.map((product) => ({
        PRODUCT_ID: product.PRODUCT_ID._id,
        PRODUCT_NAME: product.PRODUCT_ID.NAME,
        QUANTITY: product.QUANTITY,
        UNIT_PRICE: product.UNIT_PRICE,
        TOTAL_VALUE: product.TOTAL_VALUE,
      })),
      NOTE: entry.NOTE,
      TOTAL_VALUE: entry.TOTAL_VALUE,
      CREATED_AT: entry.createdAt,
    };
  }
}

module.exports = new WAREHOUSE_SERVICE();
