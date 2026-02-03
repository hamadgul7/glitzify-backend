const Order = require("../../models/orders-model");
const User = require("../../models/user/user-model");

async function getDashboardStats() {
    // -----------------------------
    // 1. Total Revenue
    // -----------------------------
    const revenueAgg = await Order.aggregate([
        {
            $group: {
                _id: null,
                totalRevenue: { $sum: "$subTotal" }
            }
        }
    ]);

    const totalRevenue = revenueAgg[0]?.totalRevenue || 0;

    // -----------------------------
    // 2. Total Profit
    // -----------------------------
    const orders = await Order.find({}, { subTotal: 1, cartItems: 1 });

    let totalProfit = 0;

    for (const order of orders) {
        let totalBuyingCost = 0;

        for (const item of order.cartItems) {
            const buyingCost = item.product.buyingCost || 0;

            // total quantity of this product (all variants)
            const totalQuantity = item.variants.reduce(
                (sum, v) => sum + v.quantity,
                0
            );

            totalBuyingCost += buyingCost * totalQuantity;
        }

        const orderProfit = order.subTotal - totalBuyingCost;
        totalProfit += orderProfit;
    }

    // -----------------------------
    // 3. Total Orders
    // -----------------------------
    const totalOrders = await Order.countDocuments();

    // -----------------------------
    // 4. Orders of Last 12 Months
    // -----------------------------
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - 11);
    startDate.setDate(1);

    const ordersByMonth = await Order.aggregate([
        {
            $match: {
                createdAt: { $gte: startDate }
            }
        },
        {
            $group: {
                _id: {
                    year: { $year: "$createdAt" },
                    month: { $month: "$createdAt" }
                },
                orders: { $sum: 1 }
            }
        }
    ]);

    // build last 12 months with zero default
    const last12Months = [];
    const monthMap = {};

    ordersByMonth.forEach(item => {
        const key = `${item._id.year}-${item._id.month}`;
        monthMap[key] = item.orders;
    });

    for (let i = 11; i >= 0; i--) {
        const date = new Date();
        date.setMonth(date.getMonth() - i);

        const year = date.getFullYear();
        const month = date.getMonth() + 1;

        const key = `${year}-${month}`;

        last12Months.push({
            month: date.toLocaleString("default", { month: "short", year: "numeric" }),
            orders: monthMap[key] || 0
        });
    }

    // -----------------------------
    // 5. Total Users
    // -----------------------------
    const totalUsers = await User.countDocuments();

    return {
        totalRevenue,
        totalProfit,
        totalOrders,
        ordersLast12Months: last12Months,
        totalUsers
    };
}

module.exports = {
    getDashboardStats
};
