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

module.exports = {
    addProductToWishlist,
    removeProductFromWishlist
};
