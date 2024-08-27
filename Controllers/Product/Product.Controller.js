const PRODUCT_MODEL = require("../../Model/Product/Product.Model");
const PRODUCT_VALIDATE = require("../../Model/Product/validate/validateProduct");
const PRODUCT_SERVICE = require("../../Service/Product/Product.Service");

class PRODUCT_CONTROLLER {
  async createProduct(req, res) {
    try {
      // Lấy schema từ phương thức static và validate dữ liệu
      const schema = PRODUCT_VALIDATE.createProduct();
      const { error, value } = schema.validate(req.body);

      if (error) {
        const errors = error.details.reduce((acc, current) => {
          acc[current.context.key] = current.message;
          return acc;
        }, {});
        return res.status(400).json({ errors });
      }

      const newProduct = await PRODUCT_SERVICE.createProduct(value);
      return res.status(201).json({
        success: true,
        message: "Tạo sản phẩm thành công!!",
        data: newProduct,
      });
    } catch (err) {
      console.error("Error creating product:", err);
      return res.status(500).json({
        success: false,
        message: "Tạo sản phẩm không thành công!!",
        err: err.message,
      });
    }
  }

  updateProduct = async (req, res) => {
    try {
      const { id } = req.params;
      const productData = req.body;

      const updatedProduct = await PRODUCT_SERVICE.updateProductById(
        id,
        productData
      );

      if (updatedProduct) {
        res.status(200).json({
          message: "Sản phẩm đã được cập nhật thành công.",
          data: updatedProduct,
        });
      } else {
        res.status(404).json({ message: "Sản phẩm không tìm thấy." });
      }
    } catch (err) {
      return res.status(500).json({ message: "Lỗi khi cập nhật sản phẩm!!" });
    }
  };
}

module.exports = new PRODUCT_CONTROLLER();
