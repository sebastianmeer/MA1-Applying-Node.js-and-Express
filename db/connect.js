const mongoose = require('mongoose');

function buildUri() {
    const raw = process.env.DATABASE;
    if (!raw) {
        throw new Error('DATABASE environment variable is not set');
    }
    if (raw.includes('<PASSWORD>')) {
        return raw.replace('<PASSWORD>', process.env.DATABASE_PASSWORD || '');
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

    if (!cached.promise) {
        const uri = buildUri();
        cached.promise = mongoose.connect(uri);
    }

    try {
        cached.conn = await cached.promise;
    } catch (err) {
        cached.promise = null;
        throw err;
    }

    return cached.conn;
}

module.exports = connectDB;
