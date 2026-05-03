const Product = require('../models/productModel');
const catchAsync = require('../utils/catchAsync');
const factory = require('./handlerFactory');

const productControllerOptions = {
    docName: 'product',
    collectionName: 'products',
    notFoundMessage: 'No product found with that ID',
};

exports.aliasTopCheapProducts = (req, res, next) => {
    req._queryDefaults = {
        limit: '3',
        sort: 'price',
        fields: 'name,price,category,seller,image,quantity,organic,description',
    };
    next();
};

exports.aliasTopFiveCheapProducts = (req, res, next) => {
    req._queryDefaults = {
        limit: '5',
        sort: 'price,name',
        fields: 'name,price,category,seller,image,quantity,organic,description',
    };
    next();
};

exports.getAllProducts = factory.getAll(Product, productControllerOptions);
exports.getProduct = factory.getOne(Product, productControllerOptions);
exports.createProduct = factory.createOne(Product, productControllerOptions);
exports.updateProduct = factory.updateOne(Product, productControllerOptions);
exports.deleteProduct = factory.deleteOne(Product, productControllerOptions);

exports.getProductCategoryStats = catchAsync(async (req, res, next) => {
    const stats = await Product.aggregate([
        {
            $match: { price: { $lt: 1000 } },
        },
        {
            $group: {
                _id: '$category',
                numProducts: { $sum: 1 },
                products: {
                    $push: {
                        id: '$_id',
                        name: '$name',
                        price: '$price',
                        seller: '$seller',
                    },
                },
                avgPrice: { $avg: '$price' },
                minPrice: { $min: '$price' },
                maxPrice: { $max: '$price' },
            },
        },
        {
            $addFields: {
                category: '$_id',
                avgPrice: { $round: ['$avgPrice', 2] },
            },
        },
        {
            $project: {
                _id: 0,
            },
        },
        {
            $sort: { avgPrice: 1 },
        },
    ]);

    res.status(200).json({
        status: 'success',
        results: stats.length,
        data: {
            stats,
        },
    });
});
