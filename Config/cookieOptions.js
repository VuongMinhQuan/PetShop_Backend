const jwt = require("jsonwebtoken");

const COOKIE_OPTIONS = {
  httpOnly: true, // Ngăn cookie được truy cập từ JavaScript
  secure: false, // Chỉ gửi cookie qua HTTPS trong môi trường production
  sameSite: "Strict",
  path: "/", // Ngăn cookie được gửi trong các request cross-site
};

module.exports = COOKIE_OPTIONS;
