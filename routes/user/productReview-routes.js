const express = require("express");
const router = express.Router();
const reviewController = require("../../controllers/user/productReview-controllers");


router.post("/addReview", reviewController.addReviewController);

router.get("/getAllReviews", reviewController.getAllReviews);

module.exports = router;
