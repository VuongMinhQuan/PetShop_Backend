const PRODUCT_MODEL = require("../../Model/Product/Product.Model");

class PRODUCT_SERVICE {
  async createProduct(data) {
    const newProduct = new PRODUCT_MODEL(data);
    const result = await newProduct.save();
    return result.toObject();
  }

  async updateProductById(id, productData) {
    const updateProduct = await PRODUCT_MODEL.findByIdAndUpdate(
      id,
      {
        ...productData,
        UPDATE_AT: new Date(),
      },
      { new: true }
    );
    return updateProduct;
  }
}

module.exports = new PRODUCT_SERVICE();
