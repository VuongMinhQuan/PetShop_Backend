const Joi = require("joi");

class PRODUCT_VALIDATE {
  static createProduct() {
    return Joi.object({
      NAME: Joi.string().trim().min(3).max(100).required().messages({
        "string.base": "Tên sản phẩm phải là một chuỗi ký tự.",
        "string.empty": "Tên sản phẩm không được để trống.",
        "string.min": "Tên sản phẩm phải có ít nhất {#limit} ký tự.",
        "string.max": "Tên sản phẩm phải có nhiều nhất {#limit} ký tự.",
        "any.required": "Tên sản phẩm là bắt buộc.",
      }),

      PRICE: Joi.number().positive().required().messages({
        "number.base": "Giá sản phẩm phải là một số.",
        "number.positive": "Giá sản phẩm phải là một số dương.",
        "any.required": "Giá sản phẩm là bắt buộc.",
      }),

      QUANTITY: Joi.number().integer().min(0).required().messages({
        "number.base": "Số lượng sản phẩm phải là một số.",
        "number.integer": "Số lượng sản phẩm phải là một số nguyên.",
        "number.min": "Số lượng sản phẩm không được nhỏ hơn {#limit}.",
        "any.required": "Số lượng sản phẩm là bắt buộc.",
      }),

      DESCRIPTION: Joi.string().allow(null, "").messages({
        "string.base": "Mô tả sản phẩm phải là một chuỗi ký tự.",
      }),

      TYPE: Joi.object({
        mainType: Joi.string()
          .valid("Animals", "Foods", "Products")
          .required()
          .messages({
            "any.only":
              "Loại sản phẩm phải là một trong các giá trị: Animals, Foods, Products.",
            "any.required": "Loại sản phẩm là bắt buộc.",
          }),
        subTypes: Joi.array()
          .items(
            Joi.string().valid(
              // Các giá trị hợp lệ cho từng loại chính
              "Alaska",
              "Husky",
              "Golden",
              "Bull Pháp",
              "Corgi",
              "Poodle",
              "Pug",
              "Samoyed",
              "Cat",
              "Bird",
              "Hamster",
              "Cat",
              "Bird",
              "Hamster", // for Animals
              "FDog",
              "FCat",
              "FBird",
              "FHamster", // for Foods
              "Toy",
              "Bag",
              "Cage" // for Products
            )
          )
          .min(1)
          .required()
          .messages({
            "any.only": "Loại phụ phải là một giá trị hợp lệ.",
            "any.required": "Loại phụ là bắt buộc.",
          }),
      })
        .required()
        .messages({
          "object.base": "TYPE phải là một đối tượng.",
          "any.required": "Loại sản phẩm là bắt buộc.",
        }),

      CREATED_AT: Joi.date().default(() => new Date()),

      UPDATE_AT: Joi.date().default(() => new Date()),

      DISCOUNT: Joi.number().min(0).max(100).allow(null).messages({
        "number.base": "Giảm giá phải là một số.",
        "number.min": "Giảm giá không được nhỏ hơn {#limit}.",
        "number.max": "Giảm giá không được lớn hơn {#limit}.",
      }),
      IMAGES: Joi.array()
        .items(Joi.string().uri().required())
        .optional()
        .messages({
          "array.base": `"IMAGES" phải là một mảng`,
          "string.base": `"IMAGES" chứa các giá trị phải là chuỗi`,
          "string.uri": `"IMAGES" chứa các giá trị phải là URL hợp lệ`,
        }),
    });
  }
}

module.exports = PRODUCT_VALIDATE;
