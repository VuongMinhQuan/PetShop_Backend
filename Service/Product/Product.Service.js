const PRODUCT_MODEL = require("../../Model/Product/Product.Model");
const CLOUDINARY = require("../../Config/cloudinaryConfig");

class PRODUCT_SERVICE {
  // Kiểm tra sản phẩm có tồn tại không
  async checkProductExists(name) {
    const searchConditions = [];

    if (name) {
      searchConditions.push({ NAME: name });
    }

    if (searchConditions.length === 0) {
      return null;
    }

    return await PRODUCT_MODEL.findOne({
      $or: searchConditions,
    }).lean();
  }

  // Tạo sản phẩm mới
  async createProduct(body) {
    let uploadedImages = []; // Đảm bảo biến được định nghĩa trước
    if (body.IMAGES && body.IMAGES.length > 0) {
      uploadedImages = await Promise.all(
        body.IMAGES.map(async (image) => {
          // Kiểm tra nếu là URL hoặc file path cục bộ
          if (image.startsWith("http")) {
            // Upload từ URL
            const uploadResult = await CLOUDINARY.uploader.upload(image);
            return uploadResult.secure_url;
          } else {
            // Upload từ file cục bộ
            const uploadResult = await CLOUDINARY.uploader.upload(image.path);
            return uploadResult.secure_url;
          }
        })
      );
    }
    const newProductData = {
      NAME: body.NAME,
      PRICE: body.PRICE,
      DESCRIPTION: body.DESCRIPTION,
      TYPE: body.TYPE,
      IMAGES: uploadedImages,
      QUANTITY: body.QUANTITY,
    };
    const newProduct = new PRODUCT_MODEL(newProductData);
    return await newProduct.save();
  }

  // Xoá sản phẩm theo ID
  async deleteProduct(productId) {
    const result = await PRODUCT_MODEL.findByIdAndUpdate(
      productId,
      { $set: { IS_DELETED: true } },
      { new: true, runValidators: true } // `new: true` để trả về tài liệu đã cập nhật
    );
    if (!result) {
      throw new Error("Product not found");
    }
    return result.toObject();
  }

  // Cập nhật thông tin sản phẩm, bao gồm URL của ảnh
  async updateProduct(productId, updateData) {
    try {
      const result = await PRODUCT_MODEL.findByIdAndUpdate(
        productId,
        updateData,
        {
          new: true,
        }
      );
      if (!result) {
        throw new Error("Product not found");
      }
      return result;
    } catch (error) {
      console.error("Error updating product:", error);
      throw new Error("Error updating product");
    }
  }

  // Lấy toàn bộ sản phẩm
  async getAllProducts() {
    try {
      return await PRODUCT_MODEL.find({
        IS_DELETED: { $in: [false, null] },
      }).lean();
    } catch (error) {
      console.error("Error retrieving products:", error);
      throw new Error("Error retrieving products");
    }
  }

  async getLatestProducts() {
    try {
      return await PRODUCT_MODEL.find({
        IS_DELETED: { $in: [false, null] },
      })
        .sort({ createdAt: -1 }) // Sắp xếp giảm dần theo ngày tạo
        .limit(3) // Giới hạn số lượng sản phẩm
        .lean();
    } catch (error) {
      console.error("Error retrieving latest products:", error);
      throw new Error("Error retrieving latest products");
    }
  }
  async searchProductByName(keyword) {
    if (!keyword) {
      throw new Error("Keyword is required for searching products.");
    }

    // Tìm kiếm sản phẩm theo từ khoá tên
    const products = await PRODUCT_MODEL.find({
      NAME: { $regex: keyword, $options: "i" }, // Tìm kiếm không phân biệt chữ hoa chữ thường
      IS_DELETED: { $in: [false, null] },
    }).lean();

    return products;
  }
  async filterProductsBySubType(subTypes) {
    return PRODUCT_MODEL.find({
      "TYPE.subTypes": { $in: subTypes }, // Sử dụng mảng subTypes trong tìm kiếm
      IS_DELETED: { $in: [false, null] },
    }).lean();
  }
  async getProductById(productId) {
    try {
      // Kiểm tra nếu productId không tồn tại
      if (!productId) {
        throw new Error("Product ID is required.");
      }

      // Tìm sản phẩm theo ID và loại bỏ các sản phẩm đã bị xóa
      const product = await PRODUCT_MODEL.findOne({
        _id: productId,
        IS_DELETED: { $in: [false, null] },
      }).lean();

      // Nếu không tìm thấy sản phẩm, báo lỗi
      if (!product) {
        throw new Error("Product not found.");
      }

      // Trả về chi tiết sản phẩm
      return product;
    } catch (error) {
      console.error("Error retrieving product by ID:", error);
      throw new Error("Error retrieving product by ID.");
    }
  }
  async getAccompanyingProducts(subType) {
    let relatedSubTypes = [];

    switch (subType) {
      case "Alaska":
      case "Husky":
      case "Golden":
      case "Bull Pháp":
      case "Corgi":
      case "Poodle":
      case "Pug":
      case "Samoyed":
        relatedSubTypes = ["FDog", "Toy", "Bag", "Cage"];
        break;
      case "Cat":
        relatedSubTypes = ["FCat", "Toy", "Bag", "Cage"];
        break;
      default:
        return [];
    }

    return await this.filterProductsBySubType(relatedSubTypes);
  }
}

module.exports = new PRODUCT_SERVICE();
