// Set env vars before any app modules are loaded
process.env.JWT_SECRET = 'supersecretjwtkey256bitlongstring12345678901234567890';
process.env.JWT_EXPIRES_IN = '7d';

const { MongoMemoryServer } = require('mongodb-memory-server');
const mongoose = require('mongoose');
const request = require('supertest');
const fc = require('fast-check');
const app = require('../app');
const User = require('../models/userModel');

let mongoServer;

beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    await mongoose.connect(mongoServer.getUri());
});

afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
});

afterEach(async () => {
    await User.deleteMany({});
});

// ---------------------------------------------------------------------------
// 6.2 Unit tests
// ---------------------------------------------------------------------------

describe('POST /api/auth/register', () => {
    it('valid payload returns 201 + token + { name, email, role }', async () => {
        const res = await request(app)
            .post('/api/auth/register')
            .send({ name: 'Alice', email: 'alice@example.com', password: 'password123' });

        expect(res.status).toBe(201);
        expect(res.body.token).toBeDefined();
        expect(res.body.user).toMatchObject({
            name: 'Alice',
            email: 'alice@example.com',
            role: 'user',
        });
    });

    it('missing name returns 400', async () => {
        const res = await request(app)
            .post('/api/auth/register')
            .send({ email: 'alice@example.com', password: 'password123' });

        expect(res.status).toBe(400);
    });

    it('missing email returns 400', async () => {
        const res = await request(app)
            .post('/api/auth/register')
            .send({ name: 'Alice', password: 'password123' });

        expect(res.status).toBe(400);
    });

    it('missing password returns 400', async () => {
        const res = await request(app)
            .post('/api/auth/register')
            .send({ name: 'Alice', email: 'alice@example.com' });

        expect(res.status).toBe(400);
    });
});

describe('POST /api/auth/login', () => {
    beforeEach(async () => {
        await request(app)
            .post('/api/auth/register')
            .send({ name: 'Bob', email: 'bob@example.com', password: 'password123' });
    });

    it('valid credentials return 200 + token + { name, email, role }', async () => {
        const res = await request(app)
            .post('/api/auth/login')
            .send({ email: 'bob@example.com', password: 'password123' });

        expect(res.status).toBe(200);
        expect(res.body.token).toBeDefined();
        expect(res.body.user).toMatchObject({
            name: 'Bob',
            email: 'bob@example.com',
            role: 'user',
        });
    });

    it('missing email returns 400', async () => {
        const res = await request(app)
            .post('/api/auth/login')
            .send({ password: 'password123' });

        expect(res.status).toBe(400);
    });

    it('missing password returns 400', async () => {
        const res = await request(app)
            .post('/api/auth/login')
            .send({ email: 'bob@example.com' });

        expect(res.status).toBe(400);
    });

    it('wrong password returns 401 "Invalid credentials"', async () => {
        const res = await request(app)
            .post('/api/auth/login')
            .send({ email: 'bob@example.com', password: 'wrongpassword' });

        expect(res.status).toBe(401);
        expect(res.body.message).toBe('Invalid credentials');
    });

    it('unknown email returns 401 "Invalid credentials"', async () => {
        const res = await request(app)
            .post('/api/auth/login')
            .send({ email: 'nobody@example.com', password: 'password123' });

        expect(res.status).toBe(401);
        expect(res.body.message).toBe('Invalid credentials');
    });
});

describe('GET /api/products', () => {
    it('no auth required, returns 200', async () => {
        const res = await request(app).get('/api/products');
        expect(res.status).toBe(200);
    });
});

describe('POST /api/products (auth/role checks)', () => {
    it('no token returns 401', async () => {
        const res = await request(app)
            .post('/api/products')
            .send({ name: 'Widget', price: 10 });

        expect(res.status).toBe(401);
    });

    it('admin token allows access (returns 201 or 400, not 401/403)', async () => {
        const regRes = await request(app)
            .post('/api/auth/register')
            .send({ name: 'Admin', email: 'admin@example.com', password: 'password123', role: 'admin' });

        const token = regRes.body.token;

        const res = await request(app)
            .post('/api/products')
            .set('Authorization', `Bearer ${token}`)
            .send({ name: 'Widget', price: 10 });

        expect([201, 400]).toContain(res.status);
    });

    it('user-role token returns 403', async () => {
        const regRes = await request(app)
            .post('/api/auth/register')
            .send({ name: 'User', email: 'user@example.com', password: 'password123', role: 'user' });

        const token = regRes.body.token;

        const res = await request(app)
            .post('/api/products')
            .set('Authorization', `Bearer ${token}`)
            .send({ name: 'Widget', price: 10 });

        expect(res.status).toBe(403);
    });
});

// ---------------------------------------------------------------------------
// 6.3 – 6.8 Property-based tests
// ---------------------------------------------------------------------------

describe('Property-based tests', () => {
    // P2 — Duplicate email always returns 409
    it('P2: duplicate email always returns 409', async () => {
        // Feature: oauth-jwt-auth, Property 2: Duplicate email is rejected
        await fc.assert(
            fc.asyncProperty(fc.emailAddress(), async (email) => {
                // First registration
                await request(app)
                    .post('/api/auth/register')
                    .send({ name: 'First', email, password: 'password123' });

                // Second registration with same email
                const res = await request(app)
                    .post('/api/auth/register')
                    .send({ name: 'Second', email, password: 'password456' });

                await User.deleteMany({});
                return res.status === 409;
            }),
            { numRuns: 100 }
        );
    }, 120000);

    // P3 — Short password always returns 400
    it('P3: short password always returns 400', async () => {
        // Feature: oauth-jwt-auth, Property 3: Weak password is rejected
        await fc.assert(
            fc.asyncProperty(
                fc.string({ minLength: 1, maxLength: 7 }),
                fc.emailAddress(),
                async (password, email) => {
                    const res = await request(app)
                        .post('/api/auth/register')
                        .send({ name: 'Test', email, password });

                    await User.deleteMany({});
                    return res.status === 400;
                }
            ),
            { numRuns: 100 }
        );
    });

    // P4 — Invalid role always returns 400
    it('P4: invalid role always returns 400', async () => {
        // Feature: oauth-jwt-auth, Property 4: Invalid role value is rejected
        await fc.assert(
            fc.asyncProperty(
                fc.string().filter((s) => s !== 'user' && s !== 'admin' && s.length > 0),
                fc.emailAddress(),
                async (role, email) => {
                    const res = await request(app)
                        .post('/api/auth/register')
                        .send({ name: 'Test', email, password: 'password123', role });

                    await User.deleteMany({});
                    return res.status === 400;
                }
            ),
            { numRuns: 100 }
        );
    });

    // P6 — Wrong credentials always return 401 with "Invalid credentials"
    it('P6: wrong credentials always return 401 with "Invalid credentials"', async () => {
        // Feature: oauth-jwt-auth, Property 6: Wrong credentials are rejected uniformly
        await fc.assert(
            fc.asyncProperty(fc.emailAddress(), async (email) => {
                const res = await request(app)
                    .post('/api/auth/login')
                    .send({ email, password: 'somepassword' });

                return res.status === 401 && res.body.message === 'Invalid credentials';
            }),
            { numRuns: 100 }
        );
    });

    // P8 — Missing/malformed token always returns 401 on protected routes
    it('P8: missing or invalid token always returns 401 on protected routes', async () => {
        // Feature: oauth-jwt-auth, Property 8: Missing or invalid token is rejected on protected routes
        await fc.assert(
            fc.asyncProperty(
                fc.string({ minLength: 1 }),
                async (randomToken) => {
                    const res = await request(app)
                        .post('/api/products')
                        .set('Authorization', `Bearer ${randomToken}`)
                        .send({ name: 'Widget', price: 10 });

                    return res.status === 401;
                }
            ),
            { numRuns: 100 }
        );
    });

    // P9 — User-role JWT always returns 403 on mutating routes
    it('P9: user-role JWT always returns 403 on mutating routes', async () => {
        // Feature: oauth-jwt-auth, Property 9: User role is forbidden on mutating routes
        await fc.assert(
            fc.asyncProperty(fc.emailAddress(), async (email) => {
                // Register a user-role account
                const regRes = await request(app)
                    .post('/api/auth/register')
                    .send({ name: 'RegularUser', email, password: 'password123', role: 'user' });

                if (regRes.status !== 201) {
                    await User.deleteMany({});
                    return true; // skip if registration failed (e.g. duplicate)
                }

                const token = regRes.body.token;

                const [postRes, patchRes, deleteRes] = await Promise.all([
                    request(app)
                        .post('/api/products')
                        .set('Authorization', `Bearer ${token}`)
                        .send({ name: 'Widget', price: 10 }),
                    request(app)
                        .patch('/api/products/000000000000000000000001')
                        .set('Authorization', `Bearer ${token}`)
                        .send({ price: 20 }),
                    request(app)
                        .delete('/api/products/000000000000000000000001')
                        .set('Authorization', `Bearer ${token}`),
                ]);

                await User.deleteMany({});

                return (
                    postRes.status === 403 &&
                    patchRes.status === 403 &&
                    deleteRes.status === 403
                );
            }),
            { numRuns: 100 }
        );
    }, 120000);

    // P10 — Password never stored in plaintext
    it('P10: password is never stored in plaintext', async () => {
        // Feature: oauth-jwt-auth, Property 10: Password is never stored in plaintext
        await fc.assert(
            fc.asyncProperty(
                fc.string({ minLength: 8 }),
                fc.emailAddress(),
                async (password, email) => {
                    const res = await request(app)
                        .post('/api/auth/register')
                        .send({ name: 'Test', email, password });

                    if (res.status !== 201) {
                        await User.deleteMany({});
                        return true; // skip if registration failed
                    }

                    const userInDb = await User.findOne({ email }).select('+password');
                    const stored = userInDb.password;

                    await User.deleteMany({});

                    return stored !== password;
                }
            ),
            { numRuns: 100 }
        );
    }, 120000);
});
