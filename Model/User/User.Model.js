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
      // STAFF: {
      //   type: Boolean,
      //   default: false,
      // },
    },
    OTP: [
      {
        TYPE: {
          type: String,
        },
        CODE: {
          type: String,
        },
        TIME: {
          type: Date,
        },
        EXP_TIME: {
          type: Date,
        },
        CHECK_USING: {
          type: Boolean,
        },
      },
    ],
    ADDRESS: {
      type: String,
      required: true,
    },
    GENDER: {
      type: String,
      required: true,
    },
    IS_BLOCKED: {
      TIME: {
        type: Date,
      },
      CHECK: {
        type: Boolean,
        default: false,
      },
      BLOCK_BY_USER_ID: {
        type: Schema.Types.ObjectId,
      },
      _id: false,
    },
    IS_ACTIVATED: {
      type: Boolean,
    },
  },
  {
    versionKey: false,
  }
);

const User = mongoose.model("User", userSchema);

module.exports = User;
