const orderService = require("../services/order-services");

async function placeOrder(req, res) {
    try {
        const order = await orderService.placeOrder(req.body);

        res.status(201).json({
            message: "Order placed successfully",
        });

    } catch (error) {
        console.error("Order placement Error:", error);
        res.status(error.statusCode || 500).json({
            message: error.message || "Internal server error"
        });
    }
}

module.exports = {
    placeOrder
};
