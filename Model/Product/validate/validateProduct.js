const Joi = require("joi");

const productValidate = Joi.object({
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

  TYPE: Joi.string().trim().required().messages({
    "string.base": "Loại sản phẩm phải là một chuỗi ký tự.",
    "string.empty": "Loại sản phẩm không được để trống.",
    "any.required": "Loại sản phẩm là bắt buộc.",
  }),

  CREATED_AT: Joi.date()
    .default(() => new Date(), "Thời gian tạo mặc định")
    .messages({
      "date.base": "Thời gian tạo phải là một ngày hợp lệ.",
    }),

  UPDATE_AT: Joi.date()
    .default(() => new Date(), "Thời gian cập nhật mặc định")
    .messages({
      "date.base": "Thời gian cập nhật phải là một ngày hợp lệ.",
    }),

  DISCOUNT: Joi.number().min(0).max(100).allow(null).messages({
    "number.base": "Giảm giá phải là một số.",
    "number.min": "Giảm giá không được nhỏ hơn {#limit}.",
    "number.max": "Giảm giá không được lớn hơn {#limit}.",
  }),
});

module.exports = {
  productValidate,
};