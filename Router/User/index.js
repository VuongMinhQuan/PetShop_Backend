const express = require("express");
const router = express.Router();
const userController = require("../../Controllers/User/User.Controller");
const { verifyToken } = require("../../Middleware/verifyToken");

router.post("/registerUser", userController.registerUser);
router.post(
  "/verifyOTPAndActivateUser",
  userController.verifyOTPAndActivateUser
);
router.post("/forgotPassword", userController.forgotPassword);
router.post("/resendOTP", userController.ResendOTP);
router.post("/resetPassword", userController.resetPassword);
router.post("/loginUser", userController.login);

module.exports = router;
