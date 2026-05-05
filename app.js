const express = require('express');
const cookieParser = require('cookie-parser');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');

if (!process.env.DATABASE) {
    const path = require('path');
    require('dotenv').config({ path: path.join(__dirname, 'config.env') });
}

const connectDB = require('./db/connect');
const productRouter = require('./routes/productRoutes');
const authRouter = require('./routes/authRoutes');
const AppError = require('./utils/appError');
const globalErrorHandler = require('./controllers/errorController');

const app = express();

app.set('query parser', 'extended');

app.use(
    helmet({
        contentSecurityPolicy: {
            directives: {
                defaultSrc: ["'self'"],
                scriptSrc: [
                    "'self'",
                    "'unsafe-inline'",
                    'https://cdn.tailwindcss.com',
                ],
                styleSrc: [
                    "'self'",
                    "'unsafe-inline'",
                    'https://fonts.googleapis.com',
                    'https://cdn.jsdelivr.net',
                ],
                fontSrc: ["'self'", 'https://fonts.gstatic.com'],
                imgSrc: ["'self'", 'data:', 'https:'],
                connectSrc: ["'self'"],
            },
        },
    })
);

if (process.env.NODE_ENV === 'development') {
    const morgan = require('morgan');
    app.use(morgan('dev'));
}

const limiter = rateLimit({
    windowMs: 60 * 60 * 1000,
    limit: 100,
    standardHeaders: 'draft-8',
    legacyHeaders: false,
    message: {
        status: 'fail',
        message: 'Too many requests from this IP. Please try again in one hour.',
    },
});

if (process.env.NODE_ENV !== 'test') {
    app.use('/api', limiter);
}
app.use(express.json({ limit: '10kb' }));
app.use(cookieParser());

const makeSanitizedFieldsWritable = (req, res, next) => {
    ['query', 'params'].forEach((field) => {
        if (req[field] !== undefined) {
            Object.defineProperty(req, field, {
                value: req[field],
                writable: true,
                enumerable: true,
                configurable: true,
            });
        }
    });
    next();
};

app.use(makeSanitizedFieldsWritable);
app.use(mongoSanitize());
app.use((req, res, next) => {
    if (typeof req.body?.password === 'string' && req.body.password.length < 8) {
        return next(new AppError('A password must have 8 characters or more', 400));
    }
    next();
});
app.use(xss());
app.use(
    hpp({
        whitelist: ['price', 'priceDiscount', 'category', 'seller', 'name', 'postedDate'],
    })
);

app.use((req, res, next) => {
    req.requestTime = new Date().toISOString();
    next();
});

const ensureDatabaseConnection = async (req, res, next) => {
    try {
        await connectDB();
        next();
    } catch (err) {
        next(err);
    }
};

app.use('/api', ensureDatabaseConnection);
app.use('/api/auth', authRouter);
app.use('/api/products', productRouter);
app.use('/api/v1/auth', authRouter);
app.use('/api/v1/products', productRouter);

app.use((req, res, next) => {
    next(new AppError(`Cannot find ${req.originalUrl} on this server!`, 404));
});

app.use(globalErrorHandler);

module.exports = app;
