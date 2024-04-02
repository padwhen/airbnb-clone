const { test, describe, after, beforeEach } = require('node:test')
const assert  = require('node:assert/strict')
const supertest = require('supertest')
const app = require('../app')
const api = supertest(app)
const User = require('../models/User')
const Booking = require('../models/Booking')
const jwt = require('jsonwebtoken')
const { JWT_SECRET } = require('../utils/config')
const { ObjectId } = require('mongoose').Types;

const bookings = [{
    place: new ObjectId(),
    user: new ObjectId(),
    checkIn: '2024-04-01',
    checkOut: '2024-04-05',
    numberOfGuests: 2,
    name: 'John Doe',
    mobile: '1234567890',
    price: 200
}, {
    place: new ObjectId(),
    user: new ObjectId(),
    checkIn: '2024-04-10',
    checkOut: '2024-04-15',
    numberOfGuests: 3,
    name: 'Jane Smith',
    mobile: '9876543210',
    price: 250
}]
;
async function createUser() {
    const existingUser = await User.findOne({ email: 'test@example.com' });
    if (existingUser) {
        return existingUser;
    } else {
        const userData = {
            name: 'Test User',
            email: 'test@example.com',
            password: 'password123'
        }
        const user = await User.create(userData);
        return user;
    }
}


describe('Booking Routers', () => {
    let user;
    let token;
    const placeId = new ObjectId()
    beforeEach(async () => {
        user = await createUser()
        token = jwt.sign({ id: user._id }, JWT_SECRET)
        bookings.forEach(booking => {
            booking.user = user._id
        })
    })
    describe('POST /api/booking', () => {
        test('should create a new booking', async () => {
            const bookingData = bookings[0]
            const response = await api
                .post('/api/booking')
                .set('Cookie', `token=${token}`)
                .send(bookingData)
                .expect(201)
                .expect('Content-Type', /application\/json/);
            const actualCheckInDate = new Date(response.body.checkIn).toISOString().split('T')[0];
            const actualCheckOutDate = new Date(response.body.checkOut).toISOString().split('T')[0];
            // Assertion: Check if the response contains the created booking object
            assert.strictEqual(response.body.place, bookingData.place.toString())
            assert.strictEqual(actualCheckInDate, bookingData.checkIn)
            assert.strictEqual(actualCheckOutDate, bookingData.checkOut)
            assert.strictEqual(response.body.numberOfGuests, bookingData.numberOfGuests)
            assert.strictEqual(response.body.mobile, bookingData.mobile)
            assert.strictEqual(response.body.name, bookingData.name)
            assert.strictEqual(response.body.price, bookingData.price)
        })
    });
    after(async () => {
        await User.deleteMany({});
        await Booking.deleteMany({})
    })
})