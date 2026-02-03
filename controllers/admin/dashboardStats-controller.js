const dashboardStatService = require("../../services/admin/dashboardStats-services");

async function getDashboardStats(req, res) {
    try {
        const stats = await dashboardStatService.getDashboardStats();
        return res.status(200).json({
            success: true,
            data: stats
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
}

module.exports = {
    getDashboardStats
};
