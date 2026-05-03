process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'supersecretjwtkey256bitlongstring12345678901234567890';
process.env.JWT_EXPIRES_IN = '7d';

const { MongoMemoryServer } = require('mongodb-memory-server');
const mongoose = require('mongoose');
const request = require('supertest');
const app = require('../app');
const Product = require('../models/productModel');
const User = require('../models/userModel');

let mongoServer;
let adminToken;

const products = [
    {
        name: 'Paperback Cookbook',
        price: 100,
        category: 'Books',
        seller: 'Mia Cruz',
        description: 'Simple home recipes.',
        quantity: '1 book',
        organic: false,
        postedDate: '2026-01-01',
    },
    {
        name: 'Used Study Lamp',
        price: 250,
        category: 'Home',
        seller: 'Nico Reyes',
        description: 'Desk lamp with warm light.',
        quantity: '1 lamp',
        organic: false,
        postedDate: '2026-01-02',
    },
    {
        name: 'Wireless Mouse',
        price: 250,
        category: 'Electronics',
        seller: 'Ana Lim',
        description: 'Compact USB wireless mouse.',
        quantity: '1 mouse',
        organic: false,
        postedDate: '2026-01-03',
    },
    {
        name: 'Canvas Backpack',
        price: 500,
        category: 'Fashion',
        seller: 'Leo Santos',
        description: 'Durable everyday backpack.',
        quantity: '1 bag',
        organic: false,
        postedDate: '2026-01-04',
    },
    {
        name: 'Yoga Blocks Pair',
        price: 900,
        category: 'Sports',
        seller: 'Rosa Diaz',
        description: 'Foam blocks for yoga practice.',
        quantity: '2 blocks',
        organic: false,
        postedDate: '2026-01-05',
    },
    {
        name: 'Wooden Side Table',
        price: 1200,
        category: 'Furniture',
        seller: 'Ben Garcia',
        description: 'Small side table in acacia.',
        quantity: '1 table',
        organic: false,
        postedDate: '2026-01-06',
    },
    {
        name: 'Premium Book Box',
        price: 50,
        category: 'Books',
        seller: 'Admin Seller',
        description: 'Premium hidden bundle.',
        quantity: '1 bundle',
        organic: false,
        postedDate: '2026-01-07',
        premiumProducts: true,
    },
];

beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    await mongoose.connect(mongoServer.getUri());
});

afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
});

beforeEach(async () => {
    await User.deleteMany({});
    await Product.deleteMany({});

    const registerRes = await request(app)
        .post('/api/auth/register')
        .send({
            name: 'Admin',
            email: 'admin@example.com',
            password: 'password123',
            role: 'admin',
        });

    adminToken = registerRes.body.token;
    await Product.insertMany(products);
});

afterEach(async () => {
    await User.deleteMany({});
    await Product.deleteMany({});
});

const getProducts = (url) =>
    request(app).get(url).set('Authorization', `Bearer ${adminToken}`);

describe('Product API query features from 4.3 API Improvement', () => {
    it('requires name, price, category, and seller and trims description', async () => {
        const product = await Product.create({
            name: 'Direct Model Product',
            price: 25,
            category: 'Model Test',
            seller: 'Direct Seller',
            description: '  Trimmed description.  ',
        });

        expect(product).toMatchObject({
            name: 'Direct Model Product',
            price: 25,
            category: 'Model Test',
            seller: 'Direct Seller',
            description: 'Trimmed description.',
        });
    });

    it('creates products with the required marketplace product format', async () => {
        const res = await request(app)
            .post('/api/products')
            .set('Authorization', `Bearer ${adminToken}`)
            .send({
                name: 'Route Test Avocados',
                price: 6.5,
                category: 'Produce',
                seller: 'Spain Market',
                image: 'https://picsum.photos/seed/route-test/400/300',
                quantity: '4 pcs',
                organic: true,
                description: 'Route create payload.',
                postedDate: '2026-01-08',
                priceDiscount: 5,
            });

        expect(res.status).toBe(201);
        expect(res.body.data.product).toMatchObject({
            name: 'Route Test Avocados',
            category: 'Produce',
            seller: 'Spain Market',
            price: 6.5,
            organic: true,
            priceDiscount: 5,
        });
    });

    it('filters with exact fields and advanced MongoDB operators', async () => {
        const res = await getProducts('/api/products?category=Books&price[lt]=300');

        expect(res.status).toBe(200);
        expect(res.body.results).toBe(1);
        expect(res.body.data.products[0].name).toBe('Paperback Cookbook');
    });

    it('sorts by one field and then a second field', async () => {
        const res = await getProducts('/api/products?sort=price,name&fields=name,price');

        expect(res.status).toBe(200);

        const names = res.body.data.products.map((product) => product.name);
        expect(names.indexOf('Used Study Lamp')).toBeLessThan(
            names.indexOf('Wireless Mouse')
        );
    });

    it('limits returned fields when fields is provided', async () => {
        const res = await getProducts('/api/products?fields=name,price,category&limit=1');
        const product = res.body.data.products[0];

        expect(res.status).toBe(200);
        expect(product).toHaveProperty('name');
        expect(product).toHaveProperty('price');
        expect(product).toHaveProperty('category');
        expect(product).not.toHaveProperty('seller');
        expect(product).not.toHaveProperty('description');
    });

    it('paginates using page and limit', async () => {
        const res = await getProducts('/api/products?sort=price&page=3&limit=2');

        expect(res.status).toBe(200);
        expect(res.body.results).toBe(2);
        expect(res.body.data.products.map((product) => product.name)).toEqual([
            'Yoga Blocks Pair',
            'Wooden Side Table',
        ]);
    });

    it('aliases /top-3-cheapest to the three cheapest products', async () => {
        const res = await getProducts('/api/products/top-3-cheapest');

        expect(res.status).toBe(200);
        expect(res.body.results).toBe(3);
        expect(res.body.data.products.map((product) => product.name)).toEqual([
            'Paperback Cookbook',
            'Used Study Lamp',
            'Wireless Mouse',
        ]);
        expect(res.body.data.products[0]).not.toHaveProperty('postedDate');
    });
});
