const PRODUCT_SERVICE = require("../../Service/Product/Product.Service");
const PRODUCT_VALIDATE = require("../../Model/Product/validate/validateProduct");

class PRODUCT_CONTROLLER {
  // Tạo sản phẩm mới
  async createProduct(req, res) {
    const payload = req.body;

    // Validate dữ liệu đầu vào
    const { error } = PRODUCT_VALIDATE.createProduct().validate(payload);
    if (error) {
      return res.status(400).json({
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
  async searchProductByName(req, res) {
    try {
      const { keyword } = req.query;

      if (!keyword) {
        return res.status(400).json({
          success: false,
          message: "Keyword is required for searching products.",
        });
      }

      const products = await PRODUCT_SERVICE.searchProductByName(keyword);

      if (products.length === 0) {
        return res.status(200).json({
          success: true,
          data: [],
          message: "No products found.",
        });
      }

      return res.status(200).json({
        success: true,
        data: products,
      });
    } catch (error) {
      console.error("Error searching products:", error);
      return res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  }
  async getProductsBySubType(req, res) {
    const { subType } = req.body; // Lấy từ body

    if (!subType) {
      return res.status(400).json({
        success: false,
        message: "subType is required.",
      });
    }

    const subTypesArray = Array.isArray(subType) ? subType : [subType];

    try {
      const products = await PRODUCT_SERVICE.filterProductsBySubType(
        subTypesArray
      );

      if (products.length === 0) {
        return res.status(200).json({
          success: true,
          message: "No products found for this subType.",
          data: [],
        });
      }

      return res.status(200).json({
        success: true,
        data: products,
      });
    } catch (error) {
      console.error("Error filtering products by subType:", error);
      return res.status(500).json({
        success: false,
        message: "Error filtering products by subType.",
        error: error.message,
      });
    }
  }
  async getProductById(req, res) {
    try {
      const { productId } = req.params; // Lấy productId từ params
      // Kiểm tra nếu không có productId
      if (!productId) {
        return res.status(400).json({
          success: false,
          message: "Product ID is required.",
        });
      }
      // Gọi service để lấy thông tin sản phẩm
      const product = await PRODUCT_SERVICE.getProductById(productId);
      // Kiểm tra nếu không tìm thấy sản phẩm
      if (!product) {
        return res.status(404).json({
          success: false,
          message: "Product not found.",
        });
      }
      // Trả về thông tin sản phẩm
      return res.status(200).json({
        success: true,
        data: product,
      });
    } catch (error) {
      console.error("Error retrieving product by ID:", error);
      return res.status(500).json({
        success: false,
        message: "Error retrieving product by ID.",
        error: error.message,
      });
    }
  }
  async getAccompanyingProducts(req, res) {
    try {
      const { productId } = req.params;

      // Lấy sản phẩm theo ID
      const product = await PRODUCT_SERVICE.getProductById(productId);

      // Kiểm tra nếu không tìm thấy sản phẩm
      if (!product) {
        return res.status(404).json({
          success: false,
          message: "Product not found.",
        });
      }

      // Lấy các sản phẩm đi kèm dựa trên subType
      const accompanyingProducts =
        await PRODUCT_SERVICE.getAccompanyingProducts(product.TYPE.subTypes[0]);

      return res.status(200).json({
        success: true,
        data: accompanyingProducts,
      });
    } catch (error) {
      console.error("Error retrieving accompanying products:", error);
      return res.status(500).json({
        success: false,
        message: "Error retrieving accompanying products.",
        error: error.message,
      });
    }
  }
}

module.exports = new PRODUCT_CONTROLLER();
