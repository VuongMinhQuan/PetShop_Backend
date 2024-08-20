const Joi = require("joi");
const { Types } = require("mongoose");
class USER_VALIDATES {
  static registerValidate = Joi.object({
    FULLNAME: Joi.string()
      .trim()
      .min(5)
      .max(100)
      .custom((value, helpers) => {
        if (value.split(" ").length < 2) {
          return helpers.message("Họ và tên phải chứa ít nhất hai từ.");
        }
        return value;
      })
      .required()
      .messages({
        "string.base": "Họ và tên phải là một chuỗi ký tự.",
        "string.empty": "Họ và tên không được để trống.",
        "string.min": "Họ và tên phải có ít nhất {#limit} ký tự.",
        "string.max": "Họ và tên phải có nhiều nhất {#limit} ký tự.",
        "any.required": "Họ và tên là bắt buộc.",
      }),

    EMAIL: Joi.string()
      .email({
        minDomainSegments: 2,
        tlds: { allow: ["com", "net"] },
      })
      .required()
      .messages({
        "string.email": "Email phải là một địa chỉ email hợp lệ.",
        "any.required": "Email là bắt buộc.",
      }),

    PHONE_NUMBER: Joi.string()
      .pattern(/^[0-9]{10,15}$/) // Ví dụ: định dạng số điện thoại 10 đến 15 chữ số
      .messages({
        "string.pattern.base": "Số điện thoại phải có từ 10 đến 15 chữ số.",
      })
      .allow(null),

    PASSWORD: Joi.string()
      .trim()
      .min(8)
      .max(32)
      .pattern(
        new RegExp(
          "^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\\$%\\^&\\*])(?!.*\\s).*$"
        )
      )
      .required()
      .messages({
        "string.pattern.base":
          "Mật khẩu phải bao gồm ít nhất một chữ cái viết hoa, một chữ cái viết thường, một số và một ký tự đặc biệt, và không được chứa khoảng trắng.",
        "string.min": "Mật khẩu phải có độ dài ít nhất là {#limit} ký tự.",
        "string.max": "Mật khẩu phải có độ dài nhiều nhất là {#limit} ký tự.",
        "any.required": "Mật khẩu là bắt buộc.",
      }),

    GENDER: Joi.string().valid("Nam", "Nữ", "Khác").optional().messages({
      "any.only": "Giới tính phải là 'Nam', 'Nữ', hoặc 'Khác'.",
    }),

    ADDRESS: Joi.string().required().messages({
      "any.required": "Địa chỉ là bắt buộc.",
      "string.empty": "Địa chỉ không được để trống.",
    }),
  });

  static loginValidate = Joi.object({
    EMAIL: Joi.string()
      .email({
        minDomainSegments: 2,
        tlds: { allow: ["com", "net"] },
      })
      .optional()
      .messages({
        "string.email": "Email phải là một địa chỉ email hợp lệ.",
      }),

    PHONE_NUMBER: Joi.string()
      .pattern(/^[0-9]{10,15}$/) // Ví dụ: định dạng số điện thoại 10 đến 15 chữ số
      .optional()
      .messages({
        "string.pattern.base": "Số điện thoại phải có từ 10 đến 15 chữ số.",
      }),

    PASSWORD: Joi.string()
      .trim()
      .min(8)
      .max(32)
      .pattern(
        new RegExp(
          "^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\\$%\\^&\\*])(?!.*\\s).*$"
        )
      )
      .required()
      .messages({
        "string.pattern.base":
          "Mật khẩu phải bao gồm ít nhất một chữ cái viết hoa, một chữ cái viết thường, một số và một ký tự đặc biệt, và không được chứa khoảng trắng.",
        "string.min": "Mật khẩu phải có độ dài ít nhất là {#limit} ký tự.",
        "string.max": "Mật khẩu phải có độ dài nhiều nhất là {#limit} ký tự.",
        "any.required": "Mật khẩu là bắt buộc.",
      }),
  });
}

module.exports = USER_VALIDATES;
