const ProductReviews = require("../../models/user/productReviews-model");
const Product = require("../../models/products-model");
const User = require("../../models/user/user-model");
const Order = require("../../models/orders-model");
const mongoose = require("mongoose");


async function addReview(reviewData) {
    const { rating, comment, userId, productId } = reviewData;
    const userObjectId = new mongoose.Types.ObjectId(userId);
    const productObjectId = new mongoose.Types.ObjectId(productId);

    const productExists = await Product.findById(productId);
    if (!productExists) {
        const error = new Error("Product not found");
        error.statusCode = 404;
        throw error;
    }

    const user = await User.findById(userId);
    if (!user) {
        const error = new Error("User not found");
        error.statusCode = 404;
        throw error;
    }

    const order = await Order.findOne({
        userId: userObjectId,
        "cartItems.product._id": productObjectId
    });

    if (!order) {
        const error = new Error("You can only review products you have purchased");
        error.statusCode = 403; 
        throw error;
    }

    const existingReview = await ProductReviews.findOne({ userId, productId });
    if (existingReview) {
        const error = new Error("You have already reviewed this product");
        error.statusCode = 400; 
        throw error;
    }

    const customerName = `${user.firstname} ${user.lastname}`;

    const review = await ProductReviews.create({
        customerName,
        rating,
        comment,
        userId,
        productId
    });

    return review;
}

async function getAllReviews() {
    const reviews = await ProductReviews.find()
        .populate({ path: "productId", select: "title" })
        .exec();

    return reviews.map(function(review) {
        return {
            _id: review._id,
            customerName: review.customerName,
            rating: review.rating,
            comment: review.comment,
            productTitle: review.productId ? review.productId.title : null
        };
    });
}

module.exports = {
    addReview,
    getAllReviews
};
