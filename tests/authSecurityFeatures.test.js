process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'supersecretjwtkey256bitlongstring12345678901234567890';
process.env.JWT_EXPIRES_IN = '7d';
process.env.JWT_COOKIE_EXPIRES_IN = '7';

jest.mock('../utils/email', () => jest.fn().mockResolvedValue({ messageId: 'test-email' }));

const jwt = require('jsonwebtoken');
const { MongoMemoryServer } = require('mongodb-memory-server');
const mongoose = require('mongoose');
const request = require('supertest');
const app = require('../app');
const Product = require('../models/productModel');
const User = require('../models/userModel');
const sendEmail = require('../utils/email');

let mongoServer;
let sequence = 0;

const uniqueEmail = (prefix = 'user') => `${prefix}-${++sequence}@example.com`;

const signup = async (overrides = {}) => {
    const password = overrides.password || 'password123';
    const payload = {
        name: overrides.name || 'Test User',
        email: overrides.email || uniqueEmail(),
        password,
        passwordConfirm: overrides.passwordConfirm || password,
        role: overrides.role,
        photo: overrides.photo,
    };

    Object.keys(payload).forEach((key) => {
        if (payload[key] === undefined) delete payload[key];
    });

    return request(app).post('/api/auth/signup').send(payload);
};

const productBody = (overrides = {}) => ({
    name: `Security Test Product ${++sequence}`,
    price: 125,
    category: 'Security',
    seller: 'Security Seller',
    image: 'https://placehold.co/400x300/e2e8f0/334155?text=Product',
    quantity: '1 item',
    organic: false,
    description: 'Security test item.',
    ...overrides,
});

const authHeader = (token) => ({ Authorization: `Bearer ${token}` });

beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    await mongoose.connect(mongoServer.getUri());
    await Product.init();
    await User.init();
});

afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
});

afterEach(async () => {
    sendEmail.mockClear();
    await User.deleteMany({});
    await Product.deleteMany({});
});

describe('5.2 authentication and authorization features', () => {
    it('signs up, hashes the password, returns a JWT, and stores it in a cookie', async () => {
        const email = uniqueEmail('cookie');
        const res = await signup({ email });

        expect(res.status).toBe(201);
        expect(res.body.token).toBeDefined();
        expect(res.headers['set-cookie'].join(';')).toContain('jwt=');

        const user = await User.findOne({ email }).select('+password');
        expect(user.password).not.toBe('password123');
    });

    it('secures getAllProducts against missing, invalid, expired, deleted-user, and old-password tokens', async () => {
        const noTokenRes = await request(app).get('/api/products');
        expect(noTokenRes.status).toBe(401);

        const signupRes = await signup({ email: uniqueEmail('valid') });
        const token = signupRes.body.token;

        const validRes = await request(app)
            .get('/api/products')
            .set(authHeader(token));
        expect(validRes.status).toBe(200);

        const invalidRes = await request(app)
            .get('/api/products')
            .set(authHeader('not-a-real-token'));
        expect(invalidRes.status).toBe(401);
        expect(invalidRes.body.message).toBe('Invalid token. Please log in again.');

        const user = await User.findOne({ email: signupRes.body.user.email });
        const expiredToken = jwt.sign(
            { id: user._id, exp: Math.floor(Date.now() / 1000) - 10 },
            process.env.JWT_SECRET
        );
        const expiredRes = await request(app)
            .get('/api/products')
            .set(authHeader(expiredToken));
        expect(expiredRes.status).toBe(401);
        expect(expiredRes.body.message).toBe('Your token has expired. Please log in again.');

        const deletedSignupRes = await signup({ email: uniqueEmail('deleted') });
        await User.deleteOne({ email: deletedSignupRes.body.user.email });
        const deletedUserRes = await request(app)
            .get('/api/products')
            .set(authHeader(deletedSignupRes.body.token));
        expect(deletedUserRes.status).toBe(401);
        expect(deletedUserRes.body.message).toBe('The user belonging to this token no longer exists.');

        const passwordSignupRes = await signup({ email: uniqueEmail('password') });
        const passwordUser = await User.findOne({ email: passwordSignupRes.body.user.email });
        const oldToken = jwt.sign(
            {
                id: passwordUser._id,
                iat: Math.floor(Date.now() / 1000) - 3600,
            },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );

        const updatePasswordRes = await request(app)
            .patch('/api/auth/updateMyPassword')
            .set(authHeader(oldToken))
            .send({
                passwordCurrent: 'password123',
                password: 'newpassword123',
                passwordConfirm: 'newpassword123',
            });
        expect(updatePasswordRes.status).toBe(200);

        const oldTokenRes = await request(app)
            .get('/api/products')
            .set(authHeader(oldToken));
        expect(oldTokenRes.status).toBe(401);
        expect(oldTokenRes.body.message).toBe('User recently changed password. Please log in again.');
    });

    it('allows product deletion for admin users and blocks normal users', async () => {
        const adminRes = await signup({ email: uniqueEmail('admin'), role: 'admin' });
        const userRes = await signup({ email: uniqueEmail('normal'), role: 'user' });

        const productRes = await request(app)
            .post('/api/products')
            .set(authHeader(adminRes.body.token))
            .send(productBody({ name: 'Role Delete Test Product' }));
        expect(productRes.status).toBe(201);

        const productId = productRes.body.data.product._id;

        const userDeleteRes = await request(app)
            .delete(`/api/products/${productId}`)
            .set(authHeader(userRes.body.token));
        expect(userDeleteRes.status).toBe(403);

        const adminDeleteRes = await request(app)
            .delete(`/api/products/${productId}`)
            .set(authHeader(adminRes.body.token));
        expect(adminDeleteRes.status).toBe(204);
    });
});

describe('5.3 account and security features', () => {
    it('sends a forgot-password token and resets the password with that token', async () => {
        const email = uniqueEmail('reset');
        await signup({ email });

        const forgotRes = await request(app)
            .post('/api/auth/forgotPassword')
            .send({ email });
        expect(forgotRes.status).toBe(200);
        expect(sendEmail).toHaveBeenCalledTimes(1);
        expect(forgotRes.body.resetToken).toBeDefined();

        const resetRes = await request(app)
            .patch(`/api/auth/resetPassword/${forgotRes.body.resetToken}`)
            .send({
                password: 'resetpassword123',
                passwordConfirm: 'resetpassword123',
            });
        expect(resetRes.status).toBe(200);
        expect(resetRes.body.token).toBeDefined();

        const loginRes = await request(app)
            .post('/api/auth/login')
            .send({ email, password: 'resetpassword123' });
        expect(loginRes.status).toBe(200);
    });

    it('updates the current user password, details, and active status using only JWT auth', async () => {
        const signupRes = await signup({ email: uniqueEmail('me') });
        const token = signupRes.body.token;

        const updateMeRes = await request(app)
            .patch('/api/auth/updateMe')
            .set(authHeader(token))
            .send({
                name: 'Updated User',
                photo: 'updated.jpg',
                role: 'admin',
            });
        expect(updateMeRes.status).toBe(200);
        expect(updateMeRes.body.data.user).toMatchObject({
            name: 'Updated User',
            photo: 'updated.jpg',
            role: 'user',
        });

        const updatePasswordRes = await request(app)
            .patch('/api/auth/updateMyPassword')
            .set(authHeader(token))
            .send({
                passwordCurrent: 'password123',
                password: 'updatedpassword123',
                passwordConfirm: 'updatedpassword123',
            });
        expect(updatePasswordRes.status).toBe(200);

        const deleteMeRes = await request(app)
            .delete('/api/auth/deleteMe')
            .set(authHeader(updatePasswordRes.body.token));
        expect(deleteMeRes.status).toBe(204);

        const deletedAccessRes = await request(app)
            .get('/api/auth/me')
            .set(authHeader(updatePasswordRes.body.token));
        expect(deletedAccessRes.status).toBe(401);
    });

    it('sanitizes HTML fields and accepts duplicate sort params without breaking HPP handling', async () => {
        const adminRes = await signup({ email: uniqueEmail('sanitize'), role: 'admin' });

        const createRes = await request(app)
            .post('/api/products')
            .set(authHeader(adminRes.body.token))
            .send(productBody({
                name: 'XSS Sanitized Product',
                description: '<script>alert(1)</script>',
            }));
        expect(createRes.status).toBe(201);
        expect(createRes.body.data.product.description).not.toContain('<script>');

        await Product.create(productBody({ name: 'Cheap HPP Product', price: 10 }));
        await Product.create(productBody({ name: 'Expensive HPP Product', price: 500 }));

        const duplicateSortRes = await request(app)
            .get('/api/products?sort=price&sort=-price')
            .set(authHeader(adminRes.body.token));

        expect(duplicateSortRes.status).toBe(200);
        expect(duplicateSortRes.body.results).toBeGreaterThanOrEqual(2);
    });
});
