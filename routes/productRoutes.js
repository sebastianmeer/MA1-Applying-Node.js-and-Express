const express = require('express');
const productController = require('../controllers/productController');

const router = express.Router();

router
    .route('/top-3-cheap')
    .get(productController.aliasTopCheapProducts, productController.getAllProducts);

router
    .route('/product-category')
    .get(productController.getProductCategoryStats);

router
    .route('/')
    .get(productController.getAllProducts)
    .post(productController.createProduct);

router
    .route('/:id')
    .get(productController.getProduct)
    .patch(productController.updateProduct)
    .delete(productController.deleteProduct);

module.exports = router;
