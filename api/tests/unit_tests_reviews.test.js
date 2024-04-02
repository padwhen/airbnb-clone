const request = require('supertest');
const app = require('../app');
const api = request(app);
const Review = require('../models/Review');
const Booking = require('../models/Booking');
const mongoose = require('mongoose');
const { ObjectId } = mongoose.Types;

const userId = new ObjectId()
const bookingId = new ObjectId()

const reviewData = {
    user: userId, booking: bookingId, ratings: { cleaniness: 4, accuracy: 5, location: 4, checkIn: 5, value: 3, checkOut: 4}, average: 4.17
}
const bookingData = {
    
}