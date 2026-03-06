const dotenv = require('dotenv');
dotenv.config({ path: './config.env' });

const app = require('./app');

const port = process.env.PORT || 3000;

app.listen(port, () => {
    console.log(`\n🛒  Local Marketplace API`);
    console.log(`───────────────────────────────────`);
    console.log(`   Environment : ${process.env.NODE_ENV}`);
    console.log(`   Port        : ${port}`);
    console.log(`   User        : ${process.env.USERNAME}`);
    console.log(`───────────────────────────────────`);
    console.log(`   Ready at    : http://127.0.0.1:${port}`);
    console.log(`   API Base    : http://127.0.0.1:${port}/api/v1/products`);
    console.log(`───────────────────────────────────\n`);
});
