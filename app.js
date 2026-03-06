const express = require('express');
const morgan = require('morgan');
const path = require('path');
const productRouter = require('./routes/productRoutes');

const app = express();

if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
}

app.use(express.json());

app.use(express.static(path.join(__dirname, 'public')));

app.use((req, res, next) => {
    req.requestTime = new Date().toISOString();
    next();
});

app.use('/api/v1/products', productRouter);

app.use((req, res) => {
    res.status(404).json({
        status: 'fail',
        message: `Cannot find ${req.originalUrl} on this server!`,
    });
});

module.exports = app;
