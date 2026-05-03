process.env.NODE_ENV = 'production';
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

const createAdminToken = async () => {
    const res = await request(app)
        .post('/api/auth/register')
        .send({
            name: 'Error Admin',
            email: 'error-admin@example.com',
            password: 'password123',
            role: 'admin',
        });

    return res.body.token;
};

const productBody = (overrides = {}) => ({
    name: 'Fresh Avocados',
    price: 6.5,
    category: 'Produce',
    seller: 'Spain Market',
    image: 'https://placehold.co/400x300?text=Avocados',
    quantity: '4 pcs',
    organic: true,
    description: 'Ripe avocados ready for salads.',
    ...overrides,
});

beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    await mongoose.connect(mongoServer.getUri());
    await Product.init();
    await User.init();
});

afterAll(async () => {
    process.env.NODE_ENV = 'test';
    await mongoose.disconnect();
    await mongoServer.stop();
});

beforeEach(async () => {
    process.env.NODE_ENV = 'production';
    await User.deleteMany({});
    await Product.deleteMany({});
    adminToken = await createAdminToken();
});

afterEach(async () => {
    await User.deleteMany({});
    await Product.deleteMany({});
});

const authed = (method, url) =>
    request(app)[method](url).set('Authorization', `Bearer ${adminToken}`);

describe('5.1 product error handling', () => {
    it('returns production-safe AppError JSON for undefined routes', async () => {
        const res = await request(app).get('/api/not-a-real-route');

        expect(res.status).toBe(404);
        expect(res.body).toMatchObject({
            status: 'fail',
            message: 'Cannot find /api/not-a-real-route on this server!',
        });
        expect(res.body.stack).toBeUndefined();
        expect(res.body.error).toBeUndefined();
    });

    it('includes stack and error details in development', async () => {
        process.env.NODE_ENV = 'development';
        const res = await request(app).get('/api/not-a-real-dev-route');
        process.env.NODE_ENV = 'production';

        expect(res.status).toBe(404);
        expect(res.body.status).toBe('fail');
        expect(res.body.message).toBe('Cannot find /api/not-a-real-dev-route on this server!');
        expect(res.body.stack).toEqual(expect.any(String));
        expect(res.body.error).toBeDefined();
    });

    it('handles invalid database ID format as a clean CastError response', async () => {
        const res = await authed('get', '/api/products/not-a-valid-object-id');

        expect(res.status).toBe(400);
        expect(res.body.status).toBe('fail');
        expect(res.body.message).toBe('Invalid _id: not-a-valid-object-id.');
        expect(res.body.stack).toBeUndefined();
    });

    it('returns 404 when a valid database ID does not exist', async () => {
        const res = await authed('get', '/api/products/507f1f77bcf86cd799439011');

        expect(res.status).toBe(404);
        expect(res.body).toMatchObject({
            status: 'fail',
            message: 'No product found with that ID',
        });
    });

    it('handles duplicate product name database errors', async () => {
        await authed('post', '/api/products').send(productBody());

        const res = await authed('post', '/api/products').send(
            productBody({
                description: 'Duplicate product name test.',
            })
        );

        expect(res.status).toBe(409);
        expect(res.body.status).toBe('fail');
        expect(res.body.message).toContain('Duplicate field value');
        expect(res.body.message).toContain('Fresh Avocados');
    });

    it('returns every mongoose validation error message in production', async () => {
        const res = await authed('post', '/api/products').send(
            productBody({
                name: 'Invalid Product',
                price: '-1',
                description: 'This description is intentionally longer than fifty characters.',
            })
        );

        expect(res.status).toBe(400);
        expect(res.body.status).toBe('fail');
        expect(res.body.message).toContain('A product price must be 0 or above');
        expect(res.body.message).toContain('A product description must have 50 characters or less');
    });

    it('sets Helmet and rate-limit headers in production', async () => {
        const res = await authed('get', '/api/products');

        expect(res.status).toBe(200);
        expect(res.headers['content-security-policy']).toContain("default-src 'self'");
        expect(res.headers['x-dns-prefetch-control']).toBe('off');
        expect(res.headers['x-frame-options']).toBe('SAMEORIGIN');
        expect(res.headers.ratelimit).toBeDefined();
        expect(res.headers['ratelimit-policy']).toBeDefined();
    });
});
