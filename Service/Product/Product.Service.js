const PRODUCT_MODEL = require("../../Model/Product/Product.Model");

class PRODUCT_SERVICE {
  async createProduct(productData) {
    const newProduct = new PRODUCT_MODEL({
      NAME: productData.NAME,
      PRICE: productData.PRICE,
      DESCRIPTION: productData.DESCRIPTION,
      TYPE: productData.TYPE,
      IMAGES: productData.IMAGES,
      QUANTITY: productData.QUANTITY,
      DISCOUNT: productData.DISCOUNT,
    });
    const savedProduct = await newProduct.save();
    return savedProduct.toObject();
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
