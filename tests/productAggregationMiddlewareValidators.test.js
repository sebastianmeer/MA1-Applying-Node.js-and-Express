process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'supersecretjwtkey256bitlongstring12345678901234567890';
process.env.JWT_EXPIRES_IN = '7d';

const fs = require('fs');
const path = require('path');
const { MongoMemoryServer } = require('mongodb-memory-server');
const mongoose = require('mongoose');
const request = require('supertest');
const app = require('../app');
const Product = require('../models/productModel');
const User = require('../models/userModel');

let mongoServer;
let adminToken;

const strictProducts = JSON.parse(
    fs.readFileSync(path.join(__dirname, '../dev-data/data/products.json'), 'utf8')
);

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
            email: 'admin-44@example.com',
            password: 'password123',
            role: 'admin',
        });

    adminToken = registerRes.body.token;
    await Product.insertMany(strictProducts);
});

afterEach(async () => {
    await User.deleteMany({});
    await Product.deleteMany({});
});

const authed = (method, url) =>
    request(app)[method](url).set('Authorization', `Bearer ${adminToken}`);

describe('Product aggregation, middleware, virtuals, and validators from 4.4', () => {
    it('aggregates products below 1000 by category and sorts by average price', async () => {
        const res = await authed('get', '/api/products/product-category');

        expect(res.status).toBe(200);
        expect(res.body.results).toBeGreaterThan(0);

        const stats = res.body.data.stats;
        stats.forEach((group) => {
            expect(group).toEqual(
                expect.objectContaining({
                    category: expect.any(String),
                    numProducts: expect.any(Number),
                    avgPrice: expect.any(Number),
                    minPrice: expect.any(Number),
                    maxPrice: expect.any(Number),
                })
            );
            expect(group.numProducts).toBeGreaterThanOrEqual(2);
            expect(group.products.every((product) => product.price < 1000)).toBe(true);
        });

        const averages = stats.map((group) => group.avgPrice);
        expect(averages).toEqual([...averages].sort((a, b) => a - b));
    });

    it('adds daysPosted virtual and uppercase productSlug document middleware value', async () => {
        const res = await authed('post', '/api/products').send({
            name: 'Slug Test Product',
            price: 10,
            category: 'Test Category',
            seller: 'Test Seller',
            image: 'https://placehold.co/400x300?text=Slug',
            quantity: '1 item',
            organic: false,
            description: 'Slug test product.',
            postedDate: '2026-01-16',
        });

        expect(res.status).toBe(201);
        expect(res.body.data.product.productSlug).toBe('SLUG-TEST-PRODUCT');
        expect(res.body.data.product.daysPosted).toEqual(expect.any(Number));
    });

    it('query middleware hides premium products from find routes', async () => {
        const rawPremium = await Product.collection.findOne({
            name: 'Premium Book Box',
        });

        expect(rawPremium).toMatchObject({
            name: 'Premium Book Box',
            premiumProducts: true,
        });

        const res = await authed('get', '/api/products');
        const names = res.body.data.products.map((product) => product.name);

        expect(res.status).toBe(200);
        expect(names).not.toContain('Premium Book Box');
    });

    it('aggregate middleware hides premium products from product-category stats', async () => {
        const res = await authed('get', '/api/products/product-category');
        const allGroupedNames = res.body.data.stats.flatMap((group) =>
            group.products.map((product) => product.name)
        );

        expect(res.status).toBe(200);
        expect(allGroupedNames).not.toContain('Premium Book Box');
    });

    it('rejects descriptions longer than 50 characters with the built-in validator', async () => {
        const res = await authed('post', '/api/products').send({
            name: 'Long Description Product',
            price: 10,
            category: 'Test Category',
            seller: 'Test Seller',
            image: 'https://placehold.co/400x300?text=Long',
            quantity: '1 item',
            organic: false,
            description: 'This description is intentionally longer than fifty characters.',
            postedDate: '2026-01-17',
        });

        expect(res.status).toBe(400);
        expect(res.body.message).toContain('50 characters or less');
    });

    it('rejects priceDiscount values that are not below price', async () => {
        await expect(
            Product.create({
                name: 'Discount Validator Product',
                price: 10,
                category: 'Test Category',
                seller: 'Test Seller',
                image: 'https://placehold.co/400x300?text=Discount',
                quantity: '1 item',
                organic: false,
                description: 'Discount validator.',
                priceDiscount: 12,
            })
        ).rejects.toThrow('should be below');
    });
});
