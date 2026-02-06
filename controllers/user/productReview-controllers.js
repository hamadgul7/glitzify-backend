const reviewService = require("../../services/user/productReview-services");

async function addReviewController(req, res) {
    try {
        const { rating, comment, userId, productId } = req.body;

        if (!rating || !comment || !userId || !productId) {
            return res.status(400).json({
                success: false,
                message: "All fields are required"
            });
        }

        const review = await reviewService.addReview({ rating, comment, userId, productId });

        res.status(201).json({
            success: true,
            message: "Review added successfully",
            data: review
        });

    } catch (error) {
        res.status(error.statusCode || 500).json({
            success: false,
            message: error.message || "Internal Server Error"
        });
    }
}

async function getAllReviews(req, res) {
    try {
        const reviews = await reviewService.getAllReviews();
        return res.status(200).json({
            success: true,
            reviews: reviews
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: "Failed to fetch reviews"
        });
    }
}

module.exports = {
    addReviewController,
    getAllReviews
};
