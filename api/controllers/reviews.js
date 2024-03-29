const reviewsRouter = require('express').Router()
const Booking = require('../models/Booking')
const Review = require('../models/Review')
const getUserDataFromReq = require('../middlewares/auth')

reviewsRouter.get('/api/account/bookings/:bookingId/reviews', async (request, response) => {
    try {
        const {bookingId} = request.params
        const review = await Review.find({ booking: bookingId })
        response.json(review)
    } catch (error) {
        console.error('Error fetching reviews: ', error)    
        response.status(500).json({ error: 'Internal Server Error '})
    }
})

reviewsRouter.get('/api/places/:placeId/reviews-in-this-place', async (request, response) => {
    try {
        const {placeId} = request.params;
        const bookings = await Booking.find({ place: placeId })
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
        response.json(bookingsWithReviews)
    } catch (error) {
        console.error('Error fetching bookings and reviews', error)
        response.status(500).json({ error: 'Internal Server Error '})
    }
})

module.exports = reviewsRouter