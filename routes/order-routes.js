const express = require("express");
const router = express.Router();

const orderController = require("../controllers/order-controllers");

// Place Order
router.post("/place-order", orderController.placeOrder);

module.exports = router;
