const User = require("../../models/user/user-model");

async function addProductToWishlist(userId, productId) {
    // Find the user by ID
    const user = await User.findById(userId);

    if (!user) {
        throw new Error("User not found");
    }

    // Check for duplicate
    const alreadyInWishlist = user.wishlist.includes(productId);
    if (alreadyInWishlist) {
        throw new Error("Product already in wishlist");
    }

    // Add productId to wishlist
    user.wishlist.push(productId);

    // Save the user
    await user.save();

    // return user.wishlist; // return updated wishlist
}


async function removeProductFromWishlist(userId, productId) {
    const user = await User.findById(userId);
    if (!user) {
        throw new Error("User not found");
    }

    // Check if product exists in wishlist
    const index = user.wishlist.indexOf(productId);
    if (index === -1) {
        throw new Error("Product not found in wishlist");
    }

    // Remove product from wishlist
    user.wishlist.splice(index, 1);

    await user.save();

}


async function getUserWishlist(userId, page, limit) {
    const user = await User.findById(userId).populate({
        path: "wishlist",
        model: "Product"
    });

    if (!user) {
        throw new Error("User not found");
    }

    const totalItems = user.wishlist.length;
    const totalPages = Math.ceil(totalItems / limit);

    // Pagination
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedWishlist = user.wishlist.slice(startIndex, endIndex);

    return {
        totalItems,
        totalPages,
        wishlist: paginatedWishlist
    };
}

module.exports = {
    addProductToWishlist,
    removeProductFromWishlist,
    getUserWishlist
};
