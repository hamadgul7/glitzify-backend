const orderService = require("../services/order-services");

async function addOrderDetails(req, res) {
    try {
        const result = await orderService.addOrderDetails(req.body);

        res.status(201).json({
            message: "Order placed successfully",
            orderId: result.orderId,
            totalAmount: result.totalAmount
        });

    } catch (error) {
        console.error("Order placement Error:", error);
        res.status(error.statusCode || 500).json({
            message: error.message || "Internal server error"
        });
    }
}

module.exports = {
    addOrderDetails
};
