const express = require("express");
const router = express.Router();
const reviewController = require("../../controllers/user/productReview-controllers");


router.post("/addReview", reviewController.addReviewController);

module.exports = router;
