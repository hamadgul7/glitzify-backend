const express = require("express");
const router = express.Router();
const wishlistController = require("../../controllers/user/wishlist-controllers");

// Add product to wishlist
router.post("/addProductInWishlist", wishlistController.addToWishlist);

router.delete("/removeProductFromWishlist", wishlistController.removeFromWishlist);

module.exports = router;
