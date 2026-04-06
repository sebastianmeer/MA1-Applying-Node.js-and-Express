const express = require('express');
const morgan = require('morgan');
const path = require('path');

// Load env variables for local development only
if (!process.env.DATABASE) {
    require('dotenv').config({ path: path.join(__dirname, '..', 'config.env') });
}

const connectDB = require('../db/connect');
const productRouter = require('../routes/productRoutes');
const authRouter = require('../routes/authRoutes');

const app = express();

if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
}

app.use(express.json());

// Attach request timestamp
app.use((req, res, next) => {
    req.requestTime = new Date().toISOString();
    next();
});

// Global cached Mongoose connection — prevents leaks on serverless cold starts
app.use(async (req, res, next) => {
    try {
        await connectDB();
        next();
    } catch (err) {
        console.error('DB connection error:', err);
        return res.status(500).json({ error: 'Database connection failed' });
    }
});

// API routes — must come BEFORE static file serving
app.use('/api/auth', authRouter);
app.use('/api/products', productRouter);

// Serve static frontend assets
app.use(express.static(path.join(__dirname, '..', 'public')));

// 404 fallback
app.use((req, res) => {
    res.status(404).json({
        status: 'fail',
        message: `Cannot find ${req.originalUrl} on this server!`,
    });
});

// Only start the HTTP server locally — Vercel exports the app as a handler
if (process.env.NODE_ENV !== 'production') {
    const port = process.env.PORT || 3000;
    connectDB()
        .then(() => {
            app.listen(port, () => {
                console.log(`Server running on http://localhost:${port}`);
            });
        })
        .catch((err) => console.error('Local DB connection failed:', err));
}

module.exports = app;
