const wishlistService = require("../../services/user/wishlist-services");

async function addToWishlist(req, res) {
    try {
        const { userId, productId } = req.body;

        if (!userId || !productId) {
            return res.status(400).json({
                success: false,
                message: "userId and productId are required"
            });
        }

        const updatedWishlist = await wishlistService.addProductToWishlist(userId, productId);

        res.status(200).json({
            success: true,
            message: "Product added to wishlist",
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
}

async function removeFromWishlist(req, res) {
    try {
        const { userId, productId } = req.body;

        if (!userId || !productId) {
            return res.status(400).json({
                success: false,
                message: "userId and productId are required"
            });
        }

        const updatedWishlist = await wishlistService.removeProductFromWishlist(userId, productId);

        res.status(200).json({
            success: true,
            message: "Product removed from wishlist",
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
}


async function getWishlist(req, res) {
    try {
        const userId = req.params.userId;
        const page = parseInt(req.query.pageNo) || 1;
        const limit = parseInt(req.query.limit) || 10;

        if (!userId) {
            return res.status(400).json({
                success: false,
                message: "userId is required"
            });
        }

        const result = await wishlistService.getUserWishlist(userId, page, limit);

        res.status(200).json({
            success: true,
            totalItems: result.totalItems,
            totalPages: result.totalPages,
            currentPage: page,
            wishlist: result.wishlist
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
}

module.exports = {
    addToWishlist,
    removeFromWishlist,
    getWishlist
};
