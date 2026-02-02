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

async function getAllOrders(req, res) {
    try {
        const page = parseInt(req.query.pageNo) || 1;
        const limit = parseInt(req.query.limit) || 10;

        const result = await orderService.getAllOrdersService(page, limit);

        res.status(200).json({
            success: true,
            message: "Orders fetched successfully",
            totalOrders: result.totalOrders,
            totalPages: result.totalPages,
            currentPage: result.currentPage,
            data: result.orders
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
}

async function updateOrderStatus(req, res) {
    try {
        const orderId  = req.params.id;
        const { status } = req.body;

        if (!status) {
            return res.status(400).json({
                success: false,
                message: "Status is required"
            });
        }

        const updatedOrder = await orderService.updateOrderStatusService(
            orderId,
            status
        );

        res.status(200).json({
            success: true,
            message: "Order status updated successfully",
            data: updatedOrder
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
}

async function getUserOrders(req, res) {
    try {
        const { userId } = req.params;

        const orders = await orderService.getUserOrdersService(userId);

        res.status(200).json({
            success: true,
            count: orders.length,
            data: orders
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
}

module.exports = {
    placeOrder,
    getAllOrders,
    updateOrderStatus,
    getUserOrders
};
