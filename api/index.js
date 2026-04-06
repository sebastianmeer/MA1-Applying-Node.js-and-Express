const path = require('path');

if (!process.env.DATABASE) {
    require('dotenv').config({ path: path.join(__dirname, '..', 'config.env') });
}

const connectDB = require('../db/connect');
const app = require('../app');

module.exports = async (req, res) => {
    try {
        await connectDB();
        return app(req, res);
    } catch (err) {
        console.error(err);
        if (!res.headersSent) {
            res.status(500).json({
                status: 'error',
                message: 'Database connection failed',
            });
        }
    }
};
