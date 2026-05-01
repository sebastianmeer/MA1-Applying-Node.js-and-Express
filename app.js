const express = require('express');
const morgan = require('morgan');
const path = require('path');
const cookieParser = require('cookie-parser');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');

if (!process.env.DATABASE) {
    require('dotenv').config({ path: path.join(__dirname, 'config.env') });
}

const connectDB = require('./db/connect');
const productRouter = require('./routes/productRoutes');
const authRouter = require('./routes/authRoutes');
const AppError = require('./utils/appError');
const globalErrorHandler = require('./controllers/errorController');

const app = express();

app.use(
    helmet({
        contentSecurityPolicy: {
            directives: {
                defaultSrc: ["'self'"],
                scriptSrc: [
                    "'self'",
                    "'unsafe-inline'",
                    "'unsafe-eval'",
                    'https://unpkg.com',
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
    req.rawBody = req.body ? JSON.parse(JSON.stringify(req.body)) : {};
    next();
});
app.use(xss());
app.use(
    hpp({
        whitelist: ['price', 'rating'],
    })
);

app.use((req, res, next) => {
    req.requestTime = new Date().toISOString();
    next();
});

if (process.env.TRIGGER_UNCAUGHT_EXCEPTION === 'true') {
    app.use((req, res, next) => {
        console.log(undefinedMiddlewareVariable);
        next();
    });
}

const ensureDatabaseConnection = async (req, res, next) => {
    try {
        await connectDB();
        next();
    } catch (err) {
        next(err);
    }
};

app.use(express.static(path.join(__dirname, 'public')));

app.use('/api', ensureDatabaseConnection);
app.use('/api/auth', authRouter);
app.use('/api/products', productRouter);

app.use((req, res, next) => {
    next(new AppError(`Cannot find ${req.originalUrl} on this server!`, 404));
});

app.use(globalErrorHandler);

module.exports = app;
