const express = require("express");
const router = express.Router();
const BOOKING_CONTROLLER = require("../../Controllers/Booking/Booking.Controller");
const {
  verifyToken,
  verifyTokenAdmin,
} = require("../../Middleware/verifyToken");
const authorizeRoles = require("../../Middleware/authorizeRoles");

router.post('/bookProductNow', verifyToken,BOOKING_CONTROLLER.bookProductNow);
router.post('/bookProductNows', verifyToken, BOOKING_CONTROLLER.bookProductNows);
router.post('/bookFormCart', verifyToken,BOOKING_CONTROLLER.bookFromCart);
router.post('/getBookingByUserId', verifyToken,BOOKING_CONTROLLER.getBookingsByUserId);
router.put(
  "/updateProductAvailability",
  verifyToken,
  BOOKING_CONTROLLER.updateProductAvailability
);

router.put('/updateStatus', verifyToken,BOOKING_CONTROLLER.updateBookingStatus);
router.get("/getAllBookings", BOOKING_CONTROLLER.getAllBookings);
router.get("/getBookingDetails/:id", BOOKING_CONTROLLER.getBookingDetails);
router.post("/shipping", BOOKING_CONTROLLER.Shipping);
router.get("/monthly", BOOKING_CONTROLLER.getMonthlyRevenue);
router.get("/totalspent", verifyToken, BOOKING_CONTROLLER.getUserTotalSpent);
router.get(
  "/revenue",
  BOOKING_CONTROLLER.getRevenue
);
router.get("/bookingstatus", BOOKING_CONTROLLER.getBookingStatusData);

module.exports = router;