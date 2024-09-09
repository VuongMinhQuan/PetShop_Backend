const PRODUCT_MODEL = require("../../Model/Product/Product.Model");

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
    try {
      const newProduct = new PRODUCT_MODEL(body);
      const result = await newProduct.save();
      return result.toObject();
    } catch (error) {
      console.error("Error creating product:", error);
      throw new Error("Error creating product");
    }
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

  // Lấy sản phẩm theo TYPE, NEWEST hoặc BEST
  // async getProductsByCriteria(criteria) {
  //   try {
  //     const { TYPE, NEWEST, BEST } = criteria;
  //     let query = {};

  //     if (TYPE) {
  //       query.TYPE = TYPE;
  //     }
  //     if (NEWEST) {
  //       query.NEWEST = NEWEST;
  //     }
  //     if (BEST) {
  //       query.BEST = BEST;
  //     }

  //     return await PRODUCT_MODEL.find(query).lean();
  //   } catch (error) {
  //     console.error("Error retrieving products by criteria:", error);
  //     throw new Error("Error retrieving products by criteria");
  //   }
  // }
}

module.exports = new PRODUCT_SERVICE();
