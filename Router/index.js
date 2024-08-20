const express = require("express");
const userRouter = require("./User");
const productRouter = require("./Product");

function route(app) {
  app.use("/users", userRouter);
  app.use("/products", productRouter);
}

module.exports = route;
