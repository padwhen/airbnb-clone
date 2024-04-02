const { test, describe, after, beforeEach } = require('node:test')
const assert  = require('node:assert/strict')
const supertest = require('supertest')
const app = require('../app')
const api = supertest(app)
const User = require('../models/User')
const jwt = require('jsonwebtoken')
const { JWT_SECRET } = require('../utils/config')
const Place = require('../models/Place')
const jest = require('jest');
const { ObjectId } = require('mongoose').Types;

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

// Differences between get /user-places and get /places is that get /user-places needs to be authorized and authenticatedx

describe('Places Router', () => {
    let user;
    let token;
    beforeEach(async () => {
        user = await createUser()
        token = jwt.sign({ id: user._id }, JWT_SECRET)
    })
    const placeData = { title: 'Test Place', address: '123 Test Street', photos: ['test.jpg'], description: 'This is a test place', perks: ['WiFi', 'Parking'], extraInfo: 'Some extra info', checkIn: 10, checkOut: 12, maxGuests: 4, price: 100 };
    describe('POST /api/places', () => {
        test('should create a new place', async () => {
            const response = await api
                .post('/api/places')
                .set('Cookie', `token=${token}`)
                .send(placeData)
                .expect(200)
                .expect('Content-Type', /application\/json/);
            // Assertion: Verify response body
            assert.ok(response.body._id)
            assert.strictEqual(Object.keys(response.body).length, Object.keys(placeData).length + 3);
            assert.strictEqual(response.body.title, placeData.title)
        })
        test('should return 401 if user is not authenticated', async () => {
            const response = await api
                .post('/api/places')
                .send(placeData)
                .expect(401)
        })
        test('should return 500 if request data is invalid', async () => {
            const invalidPlaceData = {...placeData, title: ''}
            const response = await api
                .post('/api/places')
                .set('Cookie', `token=${token}`)
                .send(invalidPlaceData)
                .expect(500);
        })
    })
    describe('GET /api/user-places', async () => {
        test('should return places belonging to the authenticated user', async () => {
            const userId = new ObjectId() 
            const token = jwt.sign({ id: userId }, JWT_SECRET)
            const place1 = await Place.create({
                owner: userId, title: 'Place 1', address: '123 Test Street', photos: ['test1.jpg'],
                description: 'This is place 1', perks: ['WiFi'], extraInfo: 'Extra info for place 1',
                checkIn: 10, checkOut: 12, maxGuests: 4, price: 100
            });
            const place2 = await Place.create({
                owner: userId, title: 'Place 2', address: '456 Test Street', photos: ['test2.jpg'],
                description: 'This is place 2', perks: ['Parking'], extraInfo: 'Extra info for place 2',
                checkIn: 11, checkOut: 13, maxGuests: 3, price: 120
            });
            const response = await api
                .get('/api/user-places')
                .set('Cookie', `token=${token}`)
                .expect(200)
                .expect('Content-Type', /application\/json/);
            assert.strictEqual(response.body.length, 2)
            assert.strictEqual(response.body[0].owner, place1.owner.toString())
            assert.strictEqual(response.body[1].owner, place2.owner.toString())
        })
        test('should return 401 if user is not authenticated', async () => {
            await api
                .get('/api/user-places')
                .expect(401)
        })
        test('should return an empty array if user has no places', async () => {
            const token = jwt.sign({ id: new ObjectId()}, JWT_SECRET)
            const response = await api
                .get('/api/user-places')
                .set('Cookie', `token=${token}`)
                .expect(200)
                .expect('Content-Type', /application\/json/);
            assert.strictEqual(response.body.length, 0)
        })
    })
    describe('PUT /api/places', async () => {
        let placeId, getPlace;
        beforeEach(async () => {
            // Using data in POST /api/places
            getPlace = await api.get('/api/user-places').set('Cookie', `token=${token}`)
            placeId = getPlace.body[0]._id
        })
        test('should update a place when authenticated and authorized', async () => {
            const place = getPlace.body[0]
            const updatedPlaceData = {...place, title: 'Updated Place Title', photos: ['test.jpg']}
            const response = await api
                .put('/api/places')
                .set('Cookie', `token=${token}`)
                .send({...updatedPlaceData, id: place._id})
                .expect(200)
                .expect('Content-Type', /application\/json/);
            // Assertions
            assert.strictEqual(response.body, 'Success')
            // Verify that the place was actually updated in the database
            const updatedPlace = await Place.findById(place._id)
            assert.strictEqual(updatedPlace.name, updatedPlaceData.name)
            assert.deepStrictEqual(updatedPlace.photos, updatedPlaceData.photos)
        })
        test('should return 403 if user is not the owner of the place', async () => {
            const anotherToken = jwt.sign({ id: new ObjectId()}, JWT_SECRET)
            const response = await api
                .put('/api/places')
                .set('Cookie', `token=${anotherToken}`)
                .send({...placeData, id: placeId})
                .expect(403)
                .expect('Content-Type', /application\/json/);
            assert.strictEqual(response.body.error, 'Unauthorized')
        })
        test('should return 404 if place is not found', async () => {
            const nonExistentPlaceId = new ObjectId()
            const response = await api
                .put('/api/places')
                .set('Cookie', `token=${token}`)
                .send({...placeData, id: nonExistentPlaceId})
                .expect(404)
                .expect('Content-Type', /application\/json/);
            assert.strictEqual(response.body.error, 'Place not found')
        })
    })
    describe('GET /api/places', async () => {
        test('should return all places', async () => {
            const userId = new ObjectId()
            const place1 = await Place.create({
                owner: userId, title: 'Finland', address: '123 Test Street', photos: ['test1.jpg'],
                description: 'This is place 1', perks: ['WiFi'], extraInfo: 'Extra info for place 1',
                checkIn: 10, checkOut: 12, maxGuests: 4, price: 100
            });
            const place2 = await Place.create({
                owner: userId, title: 'Suomi', address: '456 Test Street', photos: ['test2.jpg'],
                description: 'This is place 2', perks: ['Parking'], extraInfo: 'Extra info for place 2',
                checkIn: 11, checkOut: 13, maxGuests: 3, price: 120
            });
            const response = await api
                .get('/api/places')
                .expect(200)
                .expect('Content-Type', /application\/json/);
            assert.strictEqual(response.body.length > 2, true)
            assert.strictEqual(response.body.some(place => place.title === place1.title), true)
            assert.strictEqual(response.body.some(place => place.title === place2.title), true)
        })
    })
    after(async () => {
        await User.deleteMany({})
        await Place.deleteMany({})
    })
})