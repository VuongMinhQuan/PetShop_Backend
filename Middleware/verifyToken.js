const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
const USER_SERVICE = require("../Service/User/User.Service");
const USER_MODEL = require("../Model/User/User.Model")

dotenv.config();

const verifyToken = async (req, res, next) => {
  const authHeader = req.header("Authorization");
  const token = authHeader && authHeader.split(" ")[1];
  if (!token) {
    return res
      .status(401)
      .json({ message: "authorization token is required." });
  }

  try {
    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    req.user_id = decoded.userId;
    // const user_info = await USER_SERVICE.getUserInfo(decoded.userId);
    // req.user = user_info;
    req.user = await USER_MODEL.findById(decoded.userId).select("-password");
    if (!req.user) {
      return res.sendStatus(404);
      
    }
    next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid token." });
  }
};

module.exports = { verifyToken };
