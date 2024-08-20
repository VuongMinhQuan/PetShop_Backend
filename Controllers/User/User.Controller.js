const USER_SERVICE = require("../../Service/User/User.Service");
// const { registerValidate } = require('../../Model/User/validate/validateUser');
const USER_VALIDATES = require("../../Model/User/validate/validateUser");
const MailQueue = require("../../Utils/sendMail");
class USER_CONTROLLER {
  registerUser = async (req, res) => {
    const payload = req.body;

    const otpType = "create_account";
    // Validate dữ liệu đầu vào
    const { error, value } = USER_VALIDATES.registerValidate.validate(payload);

    if (error) {
      const errors = error.details.reduce((acc, current) => {
        acc[current.context.key] = current.message;
        return acc;
      }, {});
      return res.status(400).json({ errors });
    }
    const { EMAIL, PHONE_NUMBER } = value;
    try {
      // Kiểm tra xem người dùng đã tồn tại chưa
      const checkUserExists = await USER_SERVICE.checkUserExists(
        EMAIL,
        PHONE_NUMBER
      );
      if (checkUserExists) {
        return res
          .status(400)
          .json({ message: "Email hoặc số điện thoại đã tồn tại." });
      }

      // Đăng ký người dùng
      const newUser = await USER_SERVICE.registerUser(payload);
      const sendMail = await MailQueue.sendVerifyEmail(EMAIL, otpType);
      if (!sendMail) {
        throw new Error("Gửi email xác minh thất bại");
      }
      const { PASSWORD, ...userWithoutPassword } = newUser;
      return res.status(201).json({
        success: true,
        message: "Đăng ký người dùng thành công!!!",
        message:
          "Đăng ký người dùng thành công. Vui lòng kiểm tra email để xác thực.",
        user: userWithoutPassword,
      });
    } catch (error) {
      console.error("Error registering user:", error);
      return res.status(500).json({
        success: false,
        message: "Đăng ký người dùng thất bại!!!",
        error: error.message,
      });
    }
  };

  verifyOTPAndActivateUser = async (req, res) => {
    const { email, otp } = req.body;

    try {
      const user = await USER_SERVICE.verifyOTPAndActivateUser(email, otp);

      if (!user) {
        return res
          .status(404)
          .json({ errors: { otp: "Mã OTP không chính xác" } });
      }

      const otpDetail = user.OTP.find((item) => item.CODE === otp);
      const currentTime = Date.now();

      if (otpDetail.EXP_TIME < currentTime) {
        return res.status(400).json({ errors: { otp: "Mã OTP đã hết hạn" } });
      }

      res
        .status(200)
        .json({ message: "Kích hoạt người dùng thành công!", user });
    } catch (error) {
      console.error("Error verifying OTP and activating user:", error);
      res.status(400).json({ errors: { otp: error.message } });
    }
  };

  forgotPassword = async (req, res) => {
    try {
      const { email } = req.body;
      const existingEmail = await USER_SERVICE.checkEmailExists(email);
      if (!existingEmail) {
        return res.status(404).json({ message: "Email not found!!" });
      }
      const sendMail = await MailQueue.sendForgotPasswordEmail(email);
      if (!sendMail) {
        throw new Error("Gửi email xác minh thất bại");
      }

      return res.status(201).json({
        message: "Vui lòng kiểm tra email để xác thực.",
      });
    } catch (error) {
      console.error("Error handling forgot password request:", error);
      return res
        .status(500)
        .json({ message: "Đã xảy ra lỗi khi xử lý yêu cầu." });
    }
  };

  ResendOTP = async (req, res) => {
    try {
      const { email } = req.body;
      const existingEmail = await USER_SERVICE.checkEmailExists(email);
      if (!existingEmail) {
        return res.status(404).json({ message: "Email not found!!" });
      }
      const sendMail = await MailQueue.ResendOtp(email);
      if (!sendMail) {
        throw new Error("Gửi email xác minh thất bại");
      }

      return res.status(201).json({
        message: "Vui lòng kiểm tra email của bạn.",
      });
    } catch (error) {
      console.error("Error handling resendOTP request:", error);
      return res
        .status(500)
        .json({ message: "Đã xảy ra lỗi khi xử lý yêu cầu." });
    }
  };

  resetPassword = async (req, res) => {
    const { email, otp, newPassword } = req.body;
    try {
      const isValid = await MailService.verifyOTP(email, otp, "reset_password");
      if (!isValid) {
        return res.status(500).json({ error: "Invalid or expired OTP." });
      }
      await USER_SERVICE.resetPassword(email, newPassword);
      return res
        .status(200)
        .json({ message: "Password reset was successfully." });
    } catch (err) {
      res.status(500).json({ error: "Error resetting password" });
    }
  };

  login = async (req, res) => {
    const payload = req.body;
    const { error } = USER_VALIDATES.loginValidate.validate(payload);
    if (error) {
      return res.status(401).json({ message: error.details[0].message });
    }

    try {
      const user = await USER_SERVICE.checkUserExists(
        payload.EMAIL,
        payload.PHONE_NUMBER
      );

      if (!user) {
        return res.status(404).json({
          success: false,
          message: "Người dùng không tồn tại.",
        });
      }

      const isPasswordValid = await USER_SERVICE.checkPassword(
        payload.PASSWORD,
        user.PASSWORD
      );
      if (!isPasswordValid) {
        return res.status(401).json({
          success: false,
          message: "Mật khẩu không chính xác.",
        });
      }

      //   const payload = { id: user._id, EMAIL: user.EMAIL, PHONE_NUMBER: user.PHONE_NUMBER };
      const data_sign = {
        userId: user._id,
      };
      const accessToken = await USER_SERVICE.login(data_sign);

      return res.status(200).json({
        success: true,
        message: user,
        metadata: accessToken,
      });
    } catch (err) {
      console.error("Error logging in:", err);
      return res.status(500).json({
        success: false,
        message: "Đăng nhập thất bại.",
        error: err.message,
      });
    }
  };
}
module.exports = new USER_CONTROLLER();
