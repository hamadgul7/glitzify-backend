const express = require("express");
const router = express.Router();

const orderController = require("../controllers/order-controllers");

router.post("/place-order", orderController.placeOrder);

router.get("/allOrders", orderController.getAllOrders);

router.patch("/updateOrderStatus/:id", orderController.updateOrderStatus);

router.get("/orders/:userId", orderController.getUserOrders);

router.get("/orderDetails/:id", orderController.getOrderDetails);


module.exports = router;
