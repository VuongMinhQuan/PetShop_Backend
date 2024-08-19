const express = require("express");
const router = express.Router();
const userController = require("../../Controllers/User/User.Controller");

router.post("/registerUser", userController.registerUser);

module.exports = router;
