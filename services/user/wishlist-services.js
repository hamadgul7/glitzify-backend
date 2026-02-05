const User = require("../../models/user/user-model");

async function addProductToWishlist(userId, productId) {
    const user = await User.findById(userId);

    if (!user) {
        throw new Error("User not found");
    }

    const alreadyInWishlist = user.wishlist.includes(productId);
    if (alreadyInWishlist) {
        return {
            success: true,
            message: "Product added to wishlist"
        };
    }

    user.wishlist.push(productId);

    await user.save();

}


async function removeProductFromWishlist(userId, productId) {
    const user = await User.findById(userId);
    if (!user) {
        throw new Error("User not found");
    }

    const index = user.wishlist.indexOf(productId);
    if (index === -1) {
        throw new Error("Product not found in wishlist");
    }

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
