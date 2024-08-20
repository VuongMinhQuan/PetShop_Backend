const PRODUCT_MODEL = require("../../Model/Product/Product.Model");
const PRODUCT_SERVICE = require("../../Service/Product/Product.Service");

class PRODUCT_CONTROLLER {
  createProduct = async (req, res) => {
    const payload = req.body;

    try {
      await PRODUCT_SERVICE.createProduct(payload);
      return res.status(200).json({
        success: true,
        message: "Tạo sản phẩm thành công!!",
      });
    } catch (err) {
      return res.status(500).json({ errors: "Tạo sản phẩm thất bại!!" });
    }
  };

  updateProduct = async (req, res) => {
    try {
      const { id } = req.params;
      const productData = req.body;

      const updatedProduct = await PRODUCT_SERVICE.updateProductById(
        id,
        productData
      );

      if (updatedProduct) {
        res
          .status(200)
          .json({
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
