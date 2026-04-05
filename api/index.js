const app = require('../app');
const mongoose = require('mongoose');

// Cached connection check
const connectToDatabase = async () => {
    if (mongoose.connection.readyState >= 1) {
        return;
    }
    const DB = process.env.DATABASE.replace('<PASSWORD>', process.env.DATABASE_PASSWORD);
    await mongoose.connect(DB, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    });
};

// Vercel Serverless Function Request Handler
module.exports = async (req, res) => {
    try {
        await connectToDatabase();
        return app(req, res);
    } catch (err) {
        res.status(500).json({ error: 'Database connection failed' });
    }
};
