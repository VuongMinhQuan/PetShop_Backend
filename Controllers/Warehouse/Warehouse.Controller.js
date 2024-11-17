const WAREHOUSE_SERVICE = require("../../Service/Warehouse/Warehouse.Service");

class WAREHOUSE_CONTROLLER {
  async createWarehouseEntry(req, res) {
    try {
      const userId = req.user_id; // Lấy ID người dùng từ token hoặc request
      const { PRODUCTS, NOTE } = req.body; // Lấy danh sách sản phẩm và ghi chú từ body

      const warehouseEntry = await WAREHOUSE_SERVICE.createWarehouseEntry(
        userId,
        PRODUCTS,
        NOTE
      );

      res.status(201).json({
        success: true,
        message: "Tạo phiếu nhập kho thành công.",
        data: warehouseEntry,
      });
    } catch (error) {
      console.error("Error in createWarehouseEntry:", error.message);
      res.status(500).json({
        success: false,
        message: "Lỗi khi tạo phiếu nhập kho.",
        error: error.message,
      });
    }
  }
  async getAllWarehouseEntries(req, res) {
    try {
      const { productId, userId, startDate, endDate, page, limit } = req.query;

      const result = await WAREHOUSE_SERVICE.getAllWarehouseEntries(
        { productId, userId, startDate, endDate },
        { page, limit }
      );

      res.status(200).json({
        success: true,
        message: "Lấy danh sách phiếu nhập thành công.",
        data: result,
      });
    } catch (error) {
      console.error("Error in getAllWarehouseEntries:", error.message);
      res.status(500).json({
        success: false,
        message: "Lỗi khi lấy danh sách phiếu nhập.",
        error: error.message,
      });
    }
  }
  async getWarehouseEntryById(req, res) {
    try {
      const { entryId } = req.params; // Lấy ID phiếu nhập từ URL

      const entry = await WAREHOUSE_SERVICE.getWarehouseEntryById(entryId);

      res.status(200).json({
        success: true,
        message: "Lấy chi tiết phiếu nhập thành công.",
        data: entry,
      });
    } catch (error) {
      console.error("Error in getWarehouseEntryById:", error.message);
      res.status(404).json({
        success: false,
        message: "Lỗi khi lấy chi tiết phiếu nhập.",
        error: error.message,
      });
    }
  }
}

module.exports = new WAREHOUSE_CONTROLLER();
