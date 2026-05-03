const path = require('path');
require('dotenv').config({ path: path.join(__dirname, 'config.env') });

process.on('uncaughtException', (err) => {
    console.log('UNCAUGHT EXCEPTION! Shutting down...');
    console.log(err.name, err.message);
    process.exit(1);
});

const connectDB = require('./db/connect');
const app = require('./app');

let server;

process.on('unhandledRejection', (err) => {
    console.log('UNHANDLED REJECTION! Shutting down...');
    console.log(err.name, err.message);
    if (server) {
        server.close(() => process.exit(1));
    } else {
        process.exit(1);
    }
});

(async () => {
    await connectDB();

    const port = process.env.PORT || 3000;
    server = app.listen(port, () => {
        console.log(`App running on port ${port} in ${process.env.NODE_ENV} mode`);
    });
})();
