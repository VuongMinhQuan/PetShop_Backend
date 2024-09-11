const express = require("express");
const userRouter = require("./User");
const productRouter = require("./Product");
const cartRouter = require("./Cart")

function route(app) {
  app.use("/users", userRouter);
  app.use("/products", productRouter);
  app.use("/carts", cartRouter);
}

module.exports = route;
