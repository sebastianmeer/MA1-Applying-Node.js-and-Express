const fs = require('fs');
const path = require('path');

const productsFilePath = path.join(__dirname, '..', 'data', 'products.json');
let products = JSON.parse(fs.readFileSync(productsFilePath, 'utf-8'));

exports.checkID = (req, res, next, val) => {
    const id = Number(val);
    const product = products.find((el) => el.id === id);

    if (!product) {
        return res.status(404).json({
            status: 'fail',
            message: `No product found with ID ${val}. Please check the ID and try again.`,
        });
    }

    req.product = product;
    next();
};

exports.checkBody = (req, res, next) => {
    const { name, price, category, description, seller } = req.body;

    const missing = [];
    if (!name) missing.push('name');
    if (price === undefined || price === null) missing.push('price');
    if (!category) missing.push('category');
    if (!description) missing.push('description');
    if (!seller) missing.push('seller');

    if (missing.length > 0) {
        return res.status(400).json({
            status: 'fail',
            message: `Missing required field(s): ${missing.join(', ')}. All fields are required to create a product.`,
        });
    }

    if (typeof price !== 'number' || price <= 0) {
        return res.status(400).json({
            status: 'fail',
            message: 'Price must be a positive number.',
        });
    }

    next();
};

exports.getAllProducts = (req, res) => {
    res.status(200).json({
        status: 'success',
        requestedAt: req.requestTime,
        results: products.length,
        data: {
            products,
        },
    });
};

exports.getProduct = (req, res) => {
    res.status(200).json({
        status: 'success',
        data: {
            product: req.product,
        },
    });
};

exports.createProduct = (req, res) => {
    const newId =
        products.length > 0 ? Math.max(...products.map((p) => p.id)) + 1 : 1;

    const newProduct = {
        id: newId,
        ...req.body,
    };

    products.push(newProduct);

    fs.writeFile(productsFilePath, JSON.stringify(products, null, 4), (err) => {
        if (err) {
            return res.status(500).json({
                status: 'error',
                message: 'Could not save the new product. Please try again.',
            });
        }

        res.status(201).json({
            status: 'success',
            message: 'Product created successfully!',
            data: {
                product: newProduct,
            },
        });
    });
};

exports.updateProduct = (req, res) => {
    res.status(500).json({
        status: 'error',
        message:
            'This route is not yet implemented. Update functionality coming soon!',
    });
};

exports.deleteProduct = (req, res) => {
    res.status(500).json({
        status: 'error',
        message:
            'This route is not yet implemented. Delete functionality coming soon!',
    });
};
