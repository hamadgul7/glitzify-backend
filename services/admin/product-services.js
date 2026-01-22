const Product = require('../../models/products-model');
const cloudinary = require('cloudinary').v2;

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});


async function createProduct(data, files) {
    if (!files || files.length === 0) throw new Error("At least one image is required");

    // Upload images to Cloudinary
    const imagePaths = await Promise.all(
        files.map(async file => {
            const result = await cloudinary.uploader.upload(file.path);
            return result.secure_url;
        })
    );

    // Calculate total quantity from variants
    const totalQuantity = data.variants.reduce((sum, variant) => sum + variant.variantTotal, 0);

    // Build product object according to schema
    const productData = {
        title: data.title,
        description: data.description,
        imagePath: imagePaths,
        price: data.price,
        category: data.category,
        subCategory: data.subCategory,
        variants: data.variants.map(variant => ({
            size: variant.size,
            variantTotal: variant.variantTotal,
            colors: variant.colors.map(color => ({
                color: color.color,
                quantity: color.quantity
            }))
        })),
        totalQuantity
    };

    // Check SKU uniqueness if SKU exists
    if (data.sku) {
        const skuExist = await Product.findOne({ sku: data.sku });
        if (skuExist && skuExist.title !== data.title) {
            throw new Error(
                `A product with the same SKU already exists but has a different title: "${skuExist.title}".`
            );
        }
        productData.sku = data.sku;
    }

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


    let filePaths = [];
    if (files && files.length > 0) {
        const uploadedImages = await Promise.all(files.map(f => cloudinary.uploader.upload(f.path)));
        filePaths = uploadedImages.map(img => img.secure_url);
    }

    if (filePaths.length === 0) {
        filePaths = product.imagePath;
    }


    const totalQuantity = data.variants.reduce((sum, variant) => sum + variant.variantTotal, 0);

    const updatedData = {
        title: data.title,
        description: data.description,
        price: data.price,
        category: data.category,
        subCategory: data.subCategory,
        variants: data.variants.map(variant => ({
            size: variant.size,
            variantTotal: variant.variantTotal,
            colors: variant.colors.map(color => ({
                color: color.color,
                quantity: color.quantity
            }))
        })),
        totalQuantity,
        imagePath: filePaths
    };


    return await Product.findByIdAndUpdate(id, updatedData, { new: true, runValidators: true });
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
