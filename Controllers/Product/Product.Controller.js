const PRODUCT_SERVICE = require("../../Service/Product/Product.Service");
const PRODUCT_VALIDATE = require("../../Model/Product/validate/validateProduct")

class PRODUCT_CONTROLLER {
  // Tạo sản phẩm mới
  async createProduct(req, res) {
    const payload = req.body;

    // Validate dữ liệu đầu vào
    const { error } = PRODUCT_VALIDATE.createProduct().validate(payload);
    if (error) {
      return res
        .status(400)
        .json({
          success: false,
          message: "Validation failed",
          errors: error.details.map((detail) => detail.message),
        });
    }

    const NAME = payload.NAME;
    try {
      if (req.files && req.files.length > 0) {
        const images = req.files.map((file) => ({ path: file.path })); // Lấy đường dẫn tạm thời từ Multer
        roomData.IMAGES = images;
      }
      const checkProductExists = await PRODUCT_SERVICE.checkProductExists(NAME);
      if (checkProductExists) {
        return res.status(400).json({ message: "Tên sản phẩm đã tồn tại." });
      }
      const newProduct = await PRODUCT_SERVICE.createProduct(payload);
      res.status(201).json(newProduct);
    } catch (error) {
      console.error("Error creating product:", error);
      res.status(500).json({ error: error.message });
    }
  }

  // Xoá sản phẩm theo ID
  deleteProduct = async (req, res) => {
    try {
      const { productId } = req.params;

      if (!productId) {
        return res.status(404).json({ message: "ProductID là bắt buộc." });
      }
      const result = await PRODUCT_SERVICE.deleteProduct(productId);
      return res.status(200).json({
        message: "Xóa sản phẩm thành công!!",
        data: result,
      });
    } catch (err) {
      return res.status(500).json({ message: "Lỗi khi xóa sản phẩm!!" });
    }
  };

  // Cập nhật thông tin sản phẩm, bao gồm URL của ảnh
  async updateProduct(req, res) {
    try {
      const { productId } = req.params;
      const updateData = req.body;

      // Validate dữ liệu cập nhật nếu cần
      const { error } = PRODUCT_VALIDATE.createProduct().validate(updateData);
      if (error) {
        return res.status(400).json({ message: error.details[0].message });
      }

      const updatedProduct = await PRODUCT_SERVICE.updateProduct(
        productId,
        updateData
      );
      res.status(200).json(updatedProduct);
    } catch (error) {
      console.error("Error updating product:", error);
      res.status(500).json({ error: error.message });
    }
  }

  // Lấy toàn bộ sản phẩm
  async getAllProducts(req, res) {
    try {
      const products = await PRODUCT_SERVICE.getAllProducts();
      res.status(200).json(products);
    } catch (error) {
      console.error("Error retrieving products:", error);
      res.status(500).json({ error: error.message });
    }
  }

  async getLatestProducts(req, res) {
    try {
      const products = await PRODUCT_SERVICE.getLatestProducts();
      return res.status(200).json({
        success: true,
        data: products,
      });
    } catch (error) {
      console.error("Error retrieving latest products:", error);
      return res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  }
}

module.exports = new PRODUCT_CONTROLLER();

