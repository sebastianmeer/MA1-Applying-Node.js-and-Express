const express = require('express');
const morgan = require('morgan');
const path = require('path');

// Initialize environment variables if not present (usually for local development)
if (!process.env.DATABASE) {
    require('dotenv').config({ path: path.join(__dirname, 'config.env') });
}

const connectDB = require('./db/connect');
const productRouter = require('./routes/productRoutes');
const authRouter = require('./routes/authRoutes');

const app = express();

if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
}

app.use(express.json());

app.use((req, res, next) => {
    req.requestTime = new Date().toISOString();
    next();
});

// SERVERLESS DB CONNECTION:
// Ensure database is connected for every request (uses Mongoose global cache to prevent leaks)
app.use(async (req, res, next) => {
    try {
        await connectDB();
        next();
    } catch (err) {
        console.error('DB Connection error:', err);
        return res.status(500).json({ error: 'Database connection failed' });
    }
});

// API routes defined BEFORE static file serving to guarantee no path conflicts
app.use('/api/auth', authRouter);
app.use('/api/products', productRouter);

// Static file serving
app.use(express.static(path.join(__dirname, 'public')));

app.use((req, res) => {
    res.status(404).json({
        status: 'fail',
        message: `Cannot find ${req.originalUrl} on this server!`,
    });
});

// Start the server ONLY if not in a Vercel/Production environment
if (process.env.NODE_ENV !== 'production') {
    const port = process.env.PORT || 3000;
    connectDB().then(() => {
        app.listen(port, () => {
            console.log(`App running on port ${port} in local mode (NODE_ENV=${process.env.NODE_ENV || 'undefined'})`);
        });
    }).catch(err => console.error('Local DB connection failed:', err));
}

module.exports = app;
