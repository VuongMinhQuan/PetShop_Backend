const USER_MODEL = require("../../Model/User/User.Model");
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
const bcrypt = require("bcrypt");
class USER_SERVICE {
  async checkUserExists(email, phone) {
    // Xây dựng điều kiện tìm kiếm động
    const searchConditions = [];

    if (email) {
      searchConditions.push({ EMAIL: email });
    }
    if (phone) {
      searchConditions.push({ PHONE_NUMBER: phone });
    }

    if (searchConditions.length === 0) {
      return null;
    }

    return await USER_MODEL.findOne({
      $or: searchConditions,
    }).lean();
  }

  async checkEmailExists(email) {
    return await USER_MODEL.findOne({ EMAIL: email }).lean();
  }

  async registerUser(body) {
    const hash = await this.hashPassword(body.PASSWORD);
    const newUser = new USER_MODEL({
      FULLNAME: body.FULLNAME,
      EMAIL: body.EMAIL,
      PHONE_NUMBER: body.PHONE_NUMBER,
      PASSWORD: hash,
      ROLE: {
        ADMIN: false,
        STAFF: false,
      },
      ADDRESS: body.ADDRESS,
      GENDER: body.GENDER,
      IS_BLOCKED: null,
    });
    const result = await newUser.save();
    return result._doc;
  }

  hashPassword = async (password) => {
    const saltRounds = 10;
    const hash = await bcrypt.hashSync(password, saltRounds);
    return hash;
  };

  checkPassword = async (password, passworDB) => {
    try {
      const checkedPassword = await bcrypt.compare(password, passworDB);
      return checkedPassword;
    } catch (err) {
      return error;
    }
  };

  login = async (payload) => {
    const secret = process.env.ACCESS_TOKEN_SECRET;
    const expiresIn = "5h";
    const accessToken = jwt.sign(payload, secret, { expiresIn });
    return accessToken;
  };

  async getUserInfo(user_id) {
    const user = await USER_MODEL.findById(user_id);
    if (!user) {
      throw new Error("User not found");
    }
    return user;
  }

  async updateUserOTP(email, otp, otpType, expTime) {
    try {
      const user = await USER_MODEL.findOneAndUpdate(
        { EMAIL: email },
        {
          $push: {
            OTP: {
              TYPE: otpType,
              CODE: otp,
              TIME: Date.now(),
              EXP_TIME: expTime,
              CHECK_USING: false,
            },
          },
        },
        { new: true }
      );
    } catch (error) {
      console.error("Error updating user OTP:", error);
    }
  }

  async updateOTPstatus(email, otp) {
    try {
      const user = await USER_MODEL.findOneAndUpdate(
        { EMAIL: email, "OTP.CODE": otp },
        { $set: { "OTP.$.CHECK_USING": true } },
        { new: true }
      );
      return user;
    } catch (error) {
      console.error("Error updating user OTP:", error);
    }
  }

  async verifyOTPAndActivateUser(email, otp) {
    const updatedUser = await USER_MODEL.findOneAndUpdate(
      { EMAIL: email, "OTP.CODE": otp },
      { $set: { IS_ACTIVATED: true, "OTP.$.CHECK_USING": true } },
      { new: true }
    );

    return updatedUser;
  }

  async resetPassword(email, newPassword) {
    const hash = await this.hashPassword(newPassword);
    const result = await USER_MODEL.updateOne(
      { EMAIL: email },
      { $set: { PASSWORD: hash } }
    );

    if (result.nModified === 0) {
      throw new Error("Failed to update password. User may not exist.");
    }

    return { success: true, message: "Password updated successfully." };
  }
}

module.exports = new USER_SERVICE();
