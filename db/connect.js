const mongoose = require('mongoose');

function buildUri() {
    const raw = process.env.DATABASE;

    if (!raw) {
        throw new Error('DATABASE environment variable is not set');
    }

    if (raw.includes('<PASSWORD>')) {
        if (!process.env.DATABASE_PASSWORD) {
            throw new Error('DATABASE_PASSWORD environment variable is not set');
        }
        return raw.replace('<PASSWORD>', process.env.DATABASE_PASSWORD);
    }

    return raw;
}

let cached = global.mongoose;

if (!cached) {
    cached = global.mongoose = { conn: null, promise: null };
}

async function connectDB() {
    if (cached.conn) {
        return cached.conn;
    }

    if (mongoose.connection.readyState === 1) {
        cached.conn = mongoose.connection;
        return cached.conn;
    }

    if (!cached.promise) {
        const uri = buildUri();

        console.log('Connecting to configured MongoDB database...');
        cached.promise = mongoose.connect(uri, {
            serverSelectionTimeoutMS: Number(process.env.DB_SERVER_SELECTION_TIMEOUT_MS || 10000),
        });
    }

    try {
        cached.conn = await cached.promise;
        console.log('MongoDB connection successful!');
    } catch (err) {
        cached.promise = null;
        console.error('MongoDB connection failed.');
        throw err;
    }

    return cached.conn;
}

module.exports = connectDB;
