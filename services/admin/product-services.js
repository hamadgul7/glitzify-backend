const Product = require('../../models/products-model');
const cloudinary = require('cloudinary').v2;

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});


async function createProduct(data, files) {
    if (!files || files.length === 0) {
        throw new Error("At least one image is required");
    }

    // Upload images to Cloudinary
    const imagePaths = await Promise.all(
        files.map(async (file) => {
            const result = await cloudinary.uploader.upload(file.path);
            return result.secure_url;
        })
    );

    let variants = [];
    let totalQuantity = 0;

    // Case 1: Variants provided
    if (Array.isArray(data.variants) && data.variants.length > 0) {
        variants = data.variants.map((v, index) => {
            if (v.quantity == null) {
                throw new Error(`Quantity is required for variant at index ${index} (size: ${v.size}, color: ${v.color})`);
            }

            // Ensure at least one of size or color exists
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
    // Case 2: No variants → totalQuantity required
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
    return product;
}


async function getAllProducts(pageNo, limit) {
    let query = Product.find();
    let meta = {};

    if (pageNo && limit) {
        const pageNumber = parseInt(pageNo);
        const pageLimit = parseInt(limit);
        const skip = (pageNumber - 1) * pageLimit;

        const totalProducts = await Product.countDocuments();
        const totalPages = Math.ceil(totalProducts / pageLimit);

        query = query.skip(skip).limit(pageLimit);

        meta = {
            totalItems: totalProducts,
            totalPages,
            currentPage: pageNumber,
            pageLimit,
            nextPage: pageNumber < totalPages ? pageNumber + 1 : null,
            previousPage: pageNumber > 1 ? pageNumber - 1 : null
        };
    }

    const products = await query;
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

module.exports = {
    createProduct,
    getProductById,
    getAllProducts,
    updateProduct,
    deleteProduct
};
