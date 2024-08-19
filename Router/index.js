const express = require("express");
const userRouter = require("./User");

function route(app) {
  app.use("/users", userRouter);
}

module.exports = route;
