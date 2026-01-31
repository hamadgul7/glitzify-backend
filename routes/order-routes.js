const express = require("express");
const router = express.Router();

const orderController = require("../controllers/order-controllers");

router.post("/place-order", orderController.placeOrder);

router.get("/allOrders", orderController.getAllOrders);

module.exports = router;
