const { describe, test } = require('node:test');
const assert = require('node:assert/strict');
const jwt = require('jsonwebtoken');
const getUserDataFromReq = require('../middlewares/auth');
const bcrypt = require('bcryptjs');
const { ObjectId } = require('mongoose').Types;
const { JWT_SECRET } = require('../utils/config')

describe('Authentication Middleware Tests', () => {
    test('should extract user data from the request cookies', async () => {
        const req = { cookies: { token: 'mockToken' } }
        const mockUserData = {
            id: new ObjectId(),
            name: 'Test',
            email: 'test@email.com',
            password: 't3st1n9'
        }
        const originalImplementation = jwt.verify;
        jwt.verify = (token, secret, options, callback) => {
            callback(null, mockUserData)
        }
        try {
            const userData = await getUserDataFromReq(req);
            assert.strictEqual(userData.id, mockUserData.id, 'User ID should be extracted from the token');
        } catch (error) {
            assert.fail(`getUserDataFromReq threw an unexpected error: ${error}`);
        } finally {
            jwt.verify = originalImplementation;
        }
    })
    test('should handle invalid tokens', async () => {
        const req = { cookies: { token: 'invalidToken' } }
        const originalImplementation = jwt.verify;
        jwt.verify = (token, secret, options, callback) => {
            callback(new Error('Invalid token'))
        }
        try {
            await getUserDataFromReq(req)
            assert.fail('getUserDataFromReq did not throw an error for invalid token');
        } catch (error) {
            assert.strictEqual(error.message, 'Invalid token')
        } finally {
            jwt.verify = originalImplementation
        }
    })
    test('should handle missing tokens', async () => {
        const req = { cookies: {} }
        try {
            await getUserDataFromReq(req)
            assert.fail('getUserDataFromReq did not throw an error for missing token')
        } catch (error) {
            assert.strictEqual(error.message, 'jwt must be provided')
        }
    })
    test('should handle expired tokens', async () => {
        const req = { cookies: { token: 'expiredToken' }}
        const originalImplementation = jwt.verify;
        // Mocking the jwt.verify function to simulate an expired token
        jwt.verify = (token, secret, options, callback) => {
            callback({ name: 'TokenExpiredError', message: 'jwt expired'})
        }
        try {
            await getUserDataFromReq(req)
            assert.fail('getUserDataFromReq did not throw an error for expired token')
        } catch (error) {
            assert.strictEqual(error.message, 'jwt expired')
        } finally {
            jwt.verify = originalImplementation
        }
    })
});

describe('Password Hashing Tests', () => {
    test('should hash passwords correctly', async () => {
        const password = 'password123'
        const hashedPassword = await bcrypt.hash(password, 10)
        // Check if the hashed password is different from the original password
        assert.notStrictEqual(hashedPassword, password)
        // Verify that the hashed password matches the original password
        const isMatch = await bcrypt.compare(password, hashedPassword)
        assert.ok(isMatch)
    })
    test('should return false for incorrect passwords', async () => {
        const password = 'password123'
        const wrongPassword = 'wrongpassword'
        const hashedPassword = await bcrypt.hash(password, 10)
        // Verify that an incorrect password does not match the hashed password
        const isMatch = await bcrypt.compare(wrongPassword, hashedPassword)
        assert.strictEqual(isMatch, false)
    })
})

describe('JWT Token Generation Tests', () => {
    test('should generate JWT tokens with the correct payload', async () => {
        const userData = {
            name: 'Test',
            email: 'user@example.com',
            password: 'testing123'
        }
        // Generate a JWT token with the user data
        const token = jwt.sign(userData, JWT_SECRET)
        // Decode the token to verify its payload
        const decodedToken = jwt.verify(token, JWT_SECRET)
        delete decodedToken.iat // Remove the 'iat' property from the decoded token
        // Assert that the decoded token payload matches the original user data
        assert.deepStrictEqual(decodedToken, userData)
    })
    test('should generate JWT tokens with the correct expiration time', () => {
        const userData = {
            name: 'Test',
            email: 'user@example.com',
            password: 'testign123'
        }
        // Set the expiration time to 1 hour from now
        const expirationTime = Math.floor(Date.now() / 1000) + (60 * 60)
        // Generate a JWT token with the user data and expiration time
        const token = jwt.sign({...userData, exp: expirationTime}, JWT_SECRET)
        // Decode the token to verify its payload
        const decodedToken = jwt.verify(token, JWT_SECRET)
        // Assert that the expiration time of the decoded token matches the expected expiration time
        assert.strictEqual(decodedToken.exp, expirationTime)
    })
})