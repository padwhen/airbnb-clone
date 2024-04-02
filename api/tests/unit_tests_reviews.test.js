const { test, describe, after, beforeEach } = require('node:test')
const app = require('../app')
const assert  = require('node:assert/strict')
const supertest = require('supertest')
const api = supertest(app)
const Review = require('../models/Review');
const Booking = require('../models/Booking');
const { ObjectId } = require('mongoose').Types;

const userId = new ObjectId();
const bookingId = new ObjectId();
const placeId = new ObjectId();

const reviewData = {
    user: userId, 
    booking: bookingId, 
    ratings: { cleaniness: 4, accuracy: 5, location: 4, checkIn: 5, value: 3, checkOut: 4}, 
    average: 4.17
};
const bookingData = {
    _id: bookingId, 
    place: placeId, 
    user: userId, 
    checkIn: 11, 
    checkOut: 14, 
    numberOfGuests: 4, 
    name: 'John Doe', 
    mobile: '1234567890', 
    price: 200
};

describe('Review Routers', () => {
    beforeEach(async () => {
        await Review.deleteMany({});
        await Booking.deleteMany({});
        await Booking.create(bookingData);
        await Review.create(reviewData);
    });
    describe('GET /api/account/bookings/:bookingId/reviews', () => {
        test('should get reviews for a booking', async () => {
            const response = await api
                .get(`/api/account/bookings/${bookingData._id}/reviews`)
                .expect(200)    
                .expect('Content-Type', /application\/json/);
            assert(Array.isArray(response.body), 'Response body should be an array')
            assert(response.body.length > 0, 'Response body should contain at least one review')
            const firstReview = response.body[0]
            assert.deepStrictEqual(firstReview.ratings, reviewData.ratings, 'Review ratings should match');
            assert.strictEqual(firstReview.user, reviewData.user.toHexString(), 'Review user ID should match');
            assert.strictEqual(firstReview.booking, reviewData.booking.toHexString(), 'Review booking ID should match');
            assert.strictEqual(firstReview.average, reviewData.average, 'Review average should match');
        });
        test('should return 404 if no reviews found for the booking', async () => {
            const nonExistentBookingId = new ObjectId()
            const response = await api
                .get(`/api/account/bookings/${nonExistentBookingId}/reviews`)
                .expect(404)
                .expect('Content-Type', /application\/json/);
            assert.strictEqual(response.body.error, 'No reviews found for the specified booking')
        })
    });
    describe('GET /api/places/:placeId/reviews-in-this-place', () => {
        test('should get reviews for bookings in a place', async () => {
            const response = await api
                .get(`/api/places/${placeId}/reviews-in-this-place`)
                .expect(200)
                .expect('Content-Type', /application\/json/);
            const bookingReview = response.body[0]
            assert.strictEqual(response.body.length, 1)
            assert.strictEqual(bookingReview.booking._id, bookingData._id.toString());
            assert.deepStrictEqual(bookingReview.review.ratings, reviewData.ratings);
            assert.strictEqual(bookingReview.review.average, reviewData.average);
        })
        test('should return 404 if no bookings found for the place', async () => {
            const response = await api
                .get(`/api/places/${new ObjectId()}/reviews-in-this-place`)
                .expect(404)
                .expect('Content-Type', /application\/json/);
            assert.strictEqual(response.body.error, 'No bookings found for the specified place')
        })
        test('should return 404 if no reviews found for the bookings in the place', async () => {
            await Review.deleteMany({})
            const response = await api
                .get(`/api/places/${placeId}/reviews-in-this-place`)
                .expect(404)
                .expect('Content-Type', /application\/json/);
            assert.strictEqual(response.body.error, 'No reviews found for the bookings in this place')
        })
    })
    after(async () => {
        await Booking.deleteMany({})
        await Review.deleteMany({})
    })
});
