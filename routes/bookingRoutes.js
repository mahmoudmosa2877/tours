const express = require('express');
const bookingController = require('./../controllers/bookingController');
const authController = require('./../controllers/authController');

const router = express.Router();

router.get(
  '/checkout-sessions/:tourId',
  authController.protect,
  bookingController.makeSession
);

module.exports = router;
