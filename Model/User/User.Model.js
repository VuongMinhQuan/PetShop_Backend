const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const userSchema = new Schema(
  {
    FULLNAME: {
      type: String,
      required: true,
    },
    EMAIL: {
      type: String,
      required: true,
    },
    PHONE_NUMBER: {
      type: String,
      required: true,
    },
    PASSWORD: {
      type: String,
      required: true,
    },
    ROLE: {
      ADMIN: {
        type: Boolean,
        default: false,
      },
      STAFF: {
        type: Boolean,
        default: false,
      },
    },
    ADDRESS: {
      type: String,
      required: false,
    },
    GENDER: {
      type: String,
      required: true,
    },
    IS_BLOCKED: {
      TIME: {
        type: Date
      },
      CHECK: {
        type: Boolean,
        default: false
      },
    },
  },
  {
    versionKey: false,
  }
);

const User = mongoose.model("User", userSchema);

module.exports = User;
