const path = require('path');
require('dotenv').config({ path: path.join(__dirname, 'config.env') });

const connectDB = require('./db/connect');
const app = require('./app');

connectDB()
    .then(() => {
        const port = process.env.PORT || 3000;
        app.listen(port, () => {
            console.log(`App running on port ${port} in ${process.env.NODE_ENV} mode`);
        });
    })
    .catch((err) => {
        console.error('DB connection failed:', err.message);
        process.exit(1);
    });
