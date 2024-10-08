const express = require("express");
const userRouter = require("./User");
const productRouter = require("./Product");
const cartRouter = require("./Cart");
const bookingRouter = require("./Booking");
const paymentRouter = require("./PaymentVNPay");

function route(app) {
  app.use("/users", userRouter);
  app.use("/products", productRouter);
  app.use("/carts", cartRouter);
  app.use("/bookings", bookingRouter);
  app.use("/payments", paymentRouter);
}

module.exports = route;
