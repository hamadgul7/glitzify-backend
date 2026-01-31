const express = require("express");
const router = express.Router();

const orderController = require("../controllers/order-controllers");

// Place Order
router.post("/place-order", orderController.placeOrder);

router.get("/allOrders", orderController.getAllOrders);

module.exports = router;
