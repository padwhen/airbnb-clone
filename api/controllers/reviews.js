const reviewsRouter = require('express').Router()
const Booking = require('../models/Booking')
const Review = require('../models/Review')
const getUserDataFromReq = require('../middlewares/auth')
const { default: mongoose } = require('mongoose')

reviewsRouter.get('/api/account/bookings/:bookingId/reviews', async (request, response) => {
    try {
        const {bookingId} = request.params
        const review = await Review.find({ booking: bookingId })
        if (review.length === 0) {
            return response.status(404).json({ error: 'No reviews found for the specified booking' })
        }
        response.json(review)
    } catch (error) {
        console.error('Error fetching reviews: ', error)    
        if (error instanceof mongoose.Error.CastError) {
            response.status(400).json({ error: 'Invalid booking ID' });
        }
        response.status(500).json({ error: 'Internal Server Error '})
    }
})

reviewsRouter.get('/api/places/:placeId/reviews-in-this-place', async (request, response) => {
    try {
        const {placeId} = request.params;
        const bookings = await Booking.find({ place: placeId })
        if (!bookings || bookings.length === 0) {
            return response.status(404).json({ error: 'No bookings found for the specified place' })
        }
        const bookingsWithReviews = []
        for (const booking of bookings) {
            const review = await Review.findOne({ booking: booking._id })
            if (review) {
                bookingsWithReviews.push({
                    booking,
                    review: {
                        ratings: review.ratings,
                        average: review.average
                    }
                })
            }
        }
        if (bookingsWithReviews.length === 0) {
            return response.status(404).json({ error: 'No reviews found for the bookings in this place'})
        }
        response.json(bookingsWithReviews)
    } catch (error) {
        console.error('Error fetching bookings and reviews', error)
        response.status(500).json({ error: 'Internal Server Error '})
    }
})

module.exports = reviewsRouter