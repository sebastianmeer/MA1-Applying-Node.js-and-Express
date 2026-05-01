const express = require('express');
const productController = require('../controllers/productController');
const { protect, restrictTo } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect);

router
    .route('/top-3-cheap')
    .get(productController.aliasTopCheapProducts, productController.getAllProducts);

router
    .route('/product-category')
    .get(productController.getProductCategoryStats);

router
    .route('/')
    .get(productController.getAllProducts)
    .post(restrictTo('admin'), productController.createProduct);

router
    .route('/:id')
    .get(productController.getProduct)
    .patch(restrictTo('admin'), productController.updateProduct)
    .delete(restrictTo('admin'), productController.deleteProduct);

module.exports = router;
