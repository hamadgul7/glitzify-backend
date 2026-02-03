const express = require("express");
const router = express.Router();
const dashboardStatsController = require("../../controllers/admin/dashboardStats-controller");

router.get("/dashboardStats", dashboardStatsController.getDashboardStats);

module.exports = router;
