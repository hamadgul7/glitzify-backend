const Product = require('../../models/products-model');
const cloudinary = require('cloudinary').v2;
const ProductReviews = require('../../models/user/productReviews-model');

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});


const SUBCATEGORY_IMAGES = {
    ring: "https://res.cloudinary.com/dxeumdgez/image/upload/v1769727600/ring_dyrroi.jpg",
    earrings: "https://res.cloudinary.com/dxeumdgez/image/upload/v1769727792/earrings_aacs8s.jpg",
    bracelet: "https://res.cloudinary.com/dxeumdgez/image/upload/v1769727892/bracelet_d13vxr.jpg",
    pendants: "https://res.cloudinary.com/dxeumdgez/image/upload/v1769727948/pendants_am2h1g.jpg",
    necklace: "https://res.cloudinary.com/dxeumdgez/image/upload/v1769727985/necklace_ors6xz.jpg",
    "hand-cuffs": "https://res.cloudinary.com/dxeumdgez/image/upload/v1769728161/hand-cuffs_j8folf.jpg",

    bows: "https://res.cloudinary.com/dxeumdgez/image/upload/v1769728215/bows_sglwb3.jpg",
    clips: "https://res.cloudinary.com/dxeumdgez/image/upload/v1769728258/clips_pqcfdd.jpg",

    "hand-bags": "https://res.cloudinary.com/dxeumdgez/image/upload/v1769728327/hand-bags_toftzm.jpg",
    wallets: "https://res.cloudinary.com/dxeumdgez/image/upload/v1769728358/wallets_sverit.jpg",
    clutches: "https://res.cloudinary.com/dxeumdgez/image/upload/v1769728388/clutches_lkdei1.jpg",

    "daily-wear": "https://res.cloudinary.com/dxeumdgez/image/upload/v1769728438/daily-wear_mesugt.jpg",
    "festive-collection": "https://res.cloudinary.com/dxeumdgez/image/upload/v1769728505/festive-collection_a7qeei.jpg"
};

const STATIC_SUBCATEGORIES = {
    jewellery: [
        "ring",
        "earrings",
        "bracelet",
        "pendants",
        "necklace",
        "hand-cuffs"
    ],
    "hair-accessories": [
        "bows",
        "clips"
    ],
    bags: [
        "hand-bags",
        "wallets",
        "clutches"
    ],
    "press-on-nails": [
        "daily-wear",
        "festive-collection"
    ]
};


async function createProduct(data, files) {
    if (!files || files.length === 0) {
        throw new Error("At least one image is required");
    }

    const imagePaths = await Promise.all(
        files.map(async (file) => {
            const result = await cloudinary.uploader.upload(file.path);
            return result.secure_url;
        })
    );

    let variants = [];
    let totalQuantity = 0;

    if (Array.isArray(data.variants) && data.variants.length > 0) {
        variants = data.variants.map((v, index) => {
            if (v.quantity == null) {
                throw new Error(`Quantity is required for variant at index ${index} (size: ${v.size}, color: ${v.color})`);
            }

            if (!v.size && !v.color) {
                throw new Error(`Either size or color is required for variant at index ${index}`);
            }

            const quantity = Number(v.quantity);
            totalQuantity += quantity;

            return {
                size: v.size || null,
                color: v.color || null,
                quantity
            };
        });
    } 

    else if (data.totalQuantity != null) {
        totalQuantity = Number(data.totalQuantity);
    } 
    else {
        throw new Error("Either variants or totalQuantity must be provided");
    }

    const productData = {
        title: data.title,
        description: data.description,
        imagePath: imagePaths,
        price: data.price,
        buyingCost: data.buyingCost,
        category: data.category,
        subCategory: data.subCategory,
        variants,
        totalQuantity,
        isBestSeller: data.isBestSeller || false,
        isNewArrival: data.isNewArrival || false,
        isFeatured: data.isFeatured || false
    };

    const product = new Product(productData);
    return await product.save();
}


async function getProductById(productId) {

    const product = await Product.findById(productId);
    if (!product) throw new Error("Product not found");

    const reviews = await ProductReviews.find({ productId: productId });

    const outOfStock = product.totalQuantity === 0;

    return { ...product.toObject(), reviews, outOfStock };
}


async function getAllProducts(pageNo, limit, category, subCategory, search) {
    const pageNumber = parseInt(pageNo) || 1;
    const pageLimit = parseInt(limit) || 10;
    const skip = (pageNumber - 1) * pageLimit;

    let filter = {};

    if (category) filter.category = category;
    if (subCategory) filter.subCategory = subCategory;

    if (search) {
        const regexPattern = `${search.replace(/s$/, "")}s?`;

        filter.title = {
            $regex: regexPattern,
            $options: "i" 
        };
    }

    const totalProducts = await Product.countDocuments(filter);
    const totalPages = Math.ceil(totalProducts / pageLimit);

    const products = await Product.aggregate([
        { $match: filter },

        {
            $lookup: {
                from: "productreviews",
                localField: "_id",
                foreignField: "productId",
                as: "reviews"
            }
        },

        {
            $addFields: {
                rating: {
                    $cond: [
                        { $eq: [{ $size: "$reviews" }, 0] },
                        0,
                        { $avg: "$reviews.rating" }
                    ]
                }
            }
        },

        {
            $addFields: {
                rating: { $round: ["$rating", 1] }
            }
        },

        { $project: { reviews: 0 } },

        { $sort: { createdAt: -1 } },
        { $skip: skip },
        { $limit: pageLimit }
    ]);

    const meta = {
        totalItems: totalProducts,
        totalPages,
        currentPage: pageNumber,
        pageLimit,
        nextPage: pageNumber < totalPages ? pageNumber + 1 : null,
        previousPage: pageNumber > 1 ? pageNumber - 1 : null
    };

    return { products, meta };
}


async function updateProduct(id, data, files) {
    const product = await Product.findById(id);
    if (!product) throw new Error("Product not found");

    let imagePaths = product.imagePath;

    if (files && files.length > 0) {
        const uploadedImages = await Promise.all(
            files.map(file => cloudinary.uploader.upload(file.path))
        );
        imagePaths = uploadedImages.map(img => img.secure_url);
    }

    let variants = [];
    let totalQuantity = 0;


    if (Array.isArray(data.variants) && data.variants.length > 0) {
        variants = data.variants.map((v, index) => {
            if (v.quantity == null) {
                throw new Error(`Quantity is required for variant at index ${index}`);
            }

            if (!v.size && !v.color) {
                throw new Error(`Either size or color is required for variant at index ${index}`);
            }

            const quantity = Number(v.quantity);
            totalQuantity += quantity;

            return {
                size: v.size || null,
                color: v.color || null,
                quantity
            };
        });
    }

    else if (data.totalQuantity != null) {
        totalQuantity = Number(data.totalQuantity);
        variants = []; 
    }

    else {
        throw new Error("Either variants or totalQuantity must be provided");
    }


    const updatedData = {
        title: data.title,
        description: data.description,
        price: data.price,
        buyingCost: data.buyingCost,
        category: data.category,
        subCategory: data.subCategory,
        variants,
        totalQuantity,
        imagePath: imagePaths,
        isBestSeller: data.isBestSeller ?? product.isBestSeller,
        isNewArrival: data.isNewArrival ?? product.isNewArrival,
        isFeatured: data.isFeatured ?? product.isFeatured
    };

    return await Product.findByIdAndUpdate(
        id,
        updatedData,
        { new: true, runValidators: true }
    );
}



async function deleteProduct(productId) {
    const product = await Product.findByIdAndDelete(productId);
    if (!product) throw new Error("Product not found for deletion");
    return product;
}



async function getBestSellerProducts() {
    return await Product.find({ isBestSeller: true })
        .sort({ updatedAt: -1 }) 
        .limit(8); 
}


async function getNewArrivalProducts() {
    return await Product.find({ isNewArrival: true })
        .sort({ updatedAt: -1 }) 
        .limit(8); 
}


async function getFeaturedProducts() {
    return await Product.find({ isFeatured: true })
        .sort({ updatedAt: -1 }) 
        .limit(8); 
}


async function getCategorySummary(category) {
    const result = await Product.aggregate([
        { $match: { category } },
        {
            $group: {
                _id: "$subCategory",
                count: { $sum: 1 }
            }
        }
    ]);

    if (result.length > 0) {
        const totalCategoryCount = result.reduce(
            (sum, item) => sum + item.count,
            0
        );

        const subCategories = result.map(item => ({
            name: item._id,
            count: item.count,
            image: SUBCATEGORY_IMAGES[item._id] || null
        }));

        return {
            category,
            totalCategoryCount,
            subCategories
        };
    }

    const staticSubs = STATIC_SUBCATEGORIES[category] || [];

    return {
        category,
        totalCategoryCount: 0,
        subCategories: staticSubs.map(name => ({
            name,
            count: 0,
            image: SUBCATEGORY_IMAGES[name] || null
        }))
    };
}


async function getRelatedProducts(productId) {
    const product = await Product.findById(productId);

    if (!product) {
        return null;
    }

    const colors = product.variants.map(function (variant) {
        return variant.color;
    });

    let relatedProducts = await Product.find({
        _id: { $ne: product._id },
        category: product.category,
        subCategory: product.subCategory,
        "variants.color": { $in: colors }
    }).limit(4);

    if (relatedProducts.length === 0) {
        relatedProducts = await Product.find({
            _id: { $ne: product._id },
            category: product.category,
            subCategory: product.subCategory
        }).limit(4);
    }

    return {
        relatedProducts: relatedProducts
    };
}

module.exports = {
    createProduct,
    getProductById,
    getAllProducts,
    updateProduct,
    deleteProduct,
    getBestSellerProducts,
    getNewArrivalProducts,
    getFeaturedProducts,
    getCategorySummary,
    getRelatedProducts
};
