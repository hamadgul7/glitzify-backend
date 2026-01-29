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

module.exports = {
    addReviewController
};
