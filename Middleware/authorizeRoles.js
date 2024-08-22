const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");

const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    const userRole = req.user.ROLE;

    // Kiểm tra xem người dùng có một trong các quyền truy cập không
    if (roles.some((role) => userRole[role])) {
      next();
    } else {
      res
        .status(403)
        .json({ message: "Access denied. Insufficient permissions." });
    }
  };
};

module.exports = authorizeRoles;
