const { test, describe, after, beforeEach } = require('node:test')
const assert  = require('node:assert/strict')
const supertest = require('supertest')
const app = require('../app')
const mongoose = require('mongoose')
const api = supertest(app)
const User = require('../models/User')
const jwt = require('jsonwebtoken')
const { JWT_SECRET } = require('../utils/config')

describe('User Routers', () => {
    beforeEach(async () => {
        await User.deleteMany({})
    })
    describe('POST /api/register', () => {
        // Test registering a user with a valid data
        test('should register a new user', async () => {
            const user = {
                name: 'Test User',
                email: 'test@example.com',
                password: 'testpassword'
            }
            const response = await api
                .post('/api/register')
                .send(user)
                .expect(200)
                .expect('Content-Type', /application\/json/);
            const contents = response.body
            // Assertion 1: Verify response body properities
            assert.strictEqual(contents.hasOwnProperty('_id'), true);
            assert.strictEqual(contents.name, user.name);
            assert.strictEqual(contents.email, user.email)
            // Assertion 2: Assert that password is hashed/encrypted
            assert.notStrictEqual(contents.password, user.password)
            // Assertion 3: Validate user data in the database
            const newUser = await User.findOne({ email: user.email})
            assert.ok(newUser)
            assert.strictEqual(newUser.name, user.name)
        });
        // Test registering a user with an invalid data
        test('should return 422 for registering a user with missing fields', async () => {
            const userData = {}
            const response = await api
                .post('/api/register')
                .send(userData)
                .expect(422)
                .expect('Content-Type', /application\/json/);
                // Assertion: Expected response body to be empty
                assert.deepStrictEqual(response.body, {}, 'Expected response body to be empty');
        });
        // Test registering a user with an invalid email
        test('should return 422 for registering a user with an invalid email format', async () => {
            const userData = {
                name: 'Invalid User',
                email: 'invalid',
                password: 'invalidPassword'
            }
            const response = await api
                .post('/api/register')
                .send(userData)
                .expect(422)
                .expect('Content-Type', /application\/json/);
            // Assertion: Message error.
            assert.strictEqual(response.body.message, 'User validation failed: email: Path `email` is invalid (invalid).')
        })
    });
    describe('POST /api/login', () => {
        beforeEach(async () => {
            await User.create({
                name: 'Test User',
                email: 'test@example.com',
                // testpassword
                password: '$2y$10$o1022Mk2U5RUwQBlIv9QxeRBsIwsP0NrCQenmuSc8YvMMuJjWG3F.'
            })
        })
        // Test login with valid credentials
        test('should login with valid credentials', async () => {
            const userData = {
                email: 'test@example.com',
                password: 'testpassword'
            }
            const response = await api
                .post('/api/login')
                .send(userData)
                .expect(200)
                .expect('Content-Type', /application\/json/);
            // Assertion: Assert response body contains user data
            assert.strictEqual(response.body.name, 'Test User')
            assert.strictEqual(response.body.email, userData.email)
            assert.ok(response.body._id)
        })
        // Test login with invalid email
        test('should return 422 for logging in with an invalid email', async () => {
            const userData = {
                email: 'invalid@example.com',
                password: 'testpassword'
            }
            const response = await api
                .post('/api/login')
                .send(userData)
                .expect(422)
                .expect('Content-Type', /application\/json/);
            // Assertion: Not found the user
            assert.strictEqual(response.body, 'not found')
        })
        // Test login with incorrect password
        test('should return 422 for logging in with an incorrect password', async () => {
            const userData = {
                email: 'test@example.com',
                password: 'incorrectpassword'
            }
            const response = await api
                .post('/api/login')
                .send(userData)
                .expect(422)
                .expect('Content-Type', /application\/json/);
            // Assertion: Password is incorrect
            assert.strictEqual(response.body, 'password not ok')
        })
    });
    describe('GET /api/profile', async () => {
        // Test login with a valid token
        test('should return user profile with valid token', async () => {
            const user = await User.create({
                name: 'Test User',
                email: 'test@example.com',
                password: 'testpassword'
            })
            // Generate a valid JWT token for the user
            const token = jwt.sign({ id: user._id}, JWT_SECRET)
            // Set the token in the request cookies
            const cookies = `token=${token}`
            const response = await api
                .get('/api/profile')
                .set('Cookie', cookies)
                .expect(200)
                .expect('Content-Type', /application\/json/);
            // Assertion: Assert response body contains user profile data
            assert.strictEqual(response.body.name, user.name)
            assert.strictEqual(response.body.email, user.email)
            assert.strictEqual(response.body._id, user._id.toString())
        })
        // Test getting user profile without token
        test('should return 500 error without token', async () => {
            const response = await api
                .get('/api/profile')
                .expect(500)
                .expect('Content-Type', /application\/json/);
            // Assertion: Assert response body contains error message
            assert.strictEqual(response.body.error, 'Token not found');
        })
        // Test getting user profile with invalid token
        test('should return 500 error with invalid token', async () => {
            // Set an invalid token in the request cookies
            const cookies = 'token=invalidtoken'
            const response = await api
                .get('/api/profile')
                .set('Cookie', cookies)
                .expect(500)
                .expect('Content-Type', /application\/json/);
            // Assertion: Assert response body contains error message
            assert.strictEqual(response.body.error, 'Invalid token')
        })
        // Test getting user profile with valid token but user not found
        test('should return 500 error if user not found', async () => {
            // Mock a valid token for a non-existent user
            const token = jwt.sign({ id: 'af8d2b194e607fc1e395b723' }, JWT_SECRET)
            const cookies = `token=${token}`
            const response = await api
                .get('/api/profile')
                .set('Cookie', cookies)
                .expect(500)
                .expect('Content-Type', /application\/json/);
            // Assertion: Assert response body contains error message
            assert.strictEqual(response.body.error, 'User not found')
        })
    })    
    describe('POST /api/logout', async () => {
        test('should clear token cookie and return true', async () => {
            const response = await api
                .post('/api/logout')
                .expect(200)
                .expect('Content-Type', /application\/json/);
            // Assertion: Assert response body contains true
            assert.strictEqual(response.body, true);
            // Assertion: Assert the token cookie is cleared
            const cookies = response.headers['set-cookie'];
            assert(cookies.some(cookie => cookie.startsWith('token=;')))
        })
    })
})
after(async () => {
    await mongoose.connection.close()
})
