const productService = require('../../services/admin/product-services');

async function addProduct(req, res) {
    try {
        const data = JSON.parse(req.body.data);
        const files = req.files;

        const newProduct = await productService.createProduct(data, files);

        res.status(201).json({ newProduct, message: "Product added successfully" });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
}


async function updateProductById(req, res) {
    try {
        const { id } = req.params;
        const data = JSON.parse(req.body.data);
        const files = req.files;

        const updatedProduct = await productService.updateProduct(id, data, files);

        res.status(200).json({
            updatedProduct,
            message: "Product updated successfully"
        });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
}


async function getProductById(req, res) {
    try {
        const { id } = req.params;

        const productWithReviews = await productService.getProductById(id);

        res.status(200).json({ 
            product: productWithReviews, 
            message: "Product retrieved successfully" 
        });
    } catch (error) {
        res.status(404).json({ message: error.message });
    }
}

async function getAllProducts(req, res) {
    try {
        const { pageNo, limit, category, subCategory, search } = req.query;

        const result = await productService.getAllProducts(
            pageNo,
            limit,
            category,
            subCategory,
            search
        );

        res.status(200).json({
            ...result,
            message: "Products retrieved successfully"
        });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
}



async function deleteProductById(req, res) {
    try {
        const { id } = req.params;

        await productService.deleteProduct(id);

        res.status(200).json({
            message: "Product deleted successfully"
        });
    } catch (error) {
        res.status(400).json({
            message: error.message
        });
    }
}

async function getBestSellerProducts(req, res) {
    try {
        const products = await productService.getBestSellerProducts();

        res.status(200).json({
            products,
            count: products.length
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

async function getNewArrivalProducts(req, res) {
    try {
        const products = await productService.getNewArrivalProducts();

        res.status(200).json({
            products,
            count: products.length
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

async function getFeaturedProducts(req, res) {
    try {
        const products = await productService.getFeaturedProducts();

        res.status(200).json({
            products,
            count: products.length
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

async function getProductsByCategory(req, res) {
    try {
        const { category } = req.query;

        const data = await productService.getCategorySummary(category);

        return res.status(200).json({
            success: true,
            message: "Category summary fetched successfully",
            data
        });

    } catch (error) {
        console.error("Category summary error:", error);

        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
}

module.exports = {
    addProduct,
    updateProductById,
    getProductById,
    getAllProducts,
    deleteProductById,
    getBestSellerProducts,
    getNewArrivalProducts,
    getFeaturedProducts,
    getProductsByCategory
};
