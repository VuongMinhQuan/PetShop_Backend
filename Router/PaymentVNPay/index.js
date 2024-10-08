const express = require("express");
const router = express.Router();
const PAYMENT_CONTROLLER = require("../../Controllers/PaymentVNPay/PaymentVNPay.Controller");
const {
  verifyToken,
  verifyTokenAdmin,
} = require("../../Middleware/verifyToken");
// Route tạo URL thanh toán
router.post("/create_payment_url", PAYMENT_CONTROLLER.createPaymentVnpayUrl);
// Route xử lý phản hồi từ VNPAY sau khi thanh toán
router.get("/vnpay_return", PAYMENT_CONTROLLER.vnpayReturn);
module.exports = router;
