const dotenv = require('dotenv');
const fs = require('fs');
const path = require('path');
const connectDB = require('./db/connect');
const Product = require('./models/productModel');

dotenv.config({ path: './config.env' });

const products = JSON.parse(
    fs.readFileSync(path.join(__dirname, 'dev-data/data/products.json'), 'utf-8')
);

const importData = async () => {
    try {
        await connectDB();
        await Product.create(products);
        console.log('Data successfully loaded into marketplace.products!');
    } catch (err) {
        console.log(err);
    }
    process.exit();
};

const deleteData = async () => {
    try {
        await connectDB();
        await Product.deleteMany();
        console.log('Data successfully deleted from marketplace.products!');
    } catch (err) {
        console.log(err);
    }
    process.exit();
};

if (process.argv[2] === '--import') {
    importData();
} else if (process.argv[2] === '--delete') {
    deleteData();
}
