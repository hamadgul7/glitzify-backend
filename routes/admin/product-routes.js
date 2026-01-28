const express = require('express');
const multer = require('multer');
const productController = require('../../controllers/admin/product-controllers');
const verifyToken = require('../../middlewares/verifyToken');
const router = express.Router();

const storage = multer.diskStorage({
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`);
    }
});
const upload = multer({ storage });

router.get('/getProduct/:id', productController.getProductById);
router.get('/getAllProducts',  productController.getAllProducts);

router.post('/addProduct', verifyToken, upload.array("media", 10), productController.addProduct);

router.patch('/updateProduct/:id', verifyToken, upload.array("media", 10), productController.updateProductById);

router.delete('/deleteProduct/:id', verifyToken, productController.deleteProductById);
router.get('/getBestSellers', productController.getBestSellerProducts);

router.get('/getNewArrivals', productController.getNewArrivalProducts);

router.get('/getFeatured', productController.getFeaturedProducts);


module.exports = router;
