const express = require("express");
const router = express.Router();
const BOOKING_CONTROLLER = require("../../Controllers/Booking/Booking.Controller");
const {
  verifyToken,
  verifyTokenAdmin,
} = require("../../Middleware/verifyToken");
const authorizeRoles = require("../../Middleware/authorizeRoles");

router.post('/bookProductNow', verifyToken,BOOKING_CONTROLLER.bookProductNow);
router.post('/bookFormCart', verifyToken,BOOKING_CONTROLLER.bookFromCart);
router.post('/getBookingByUserId', verifyToken,BOOKING_CONTROLLER.getBookingsByUserId);
router.put('/updateStatus', verifyToken,BOOKING_CONTROLLER.updateBookingStatus);

module.exports = router;