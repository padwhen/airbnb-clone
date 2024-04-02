const bookingsRouter = require('express').Router()
const Booking = require('../models/Booking')
const getUserDataFromReq = require('../middlewares/auth')
const mongoose = require('mongoose')

bookingsRouter.post('/api/booking', async (request, response) => {
    try {
        const userData = await getUserDataFromReq(request);
        const { place, checkIn, checkOut, numberOfGuests, mobile, name, price } = request.body;
        if (!mongoose.Types.ObjectId.isValid(place)) {
            return response.status(400).json({ error: 'Invalid place ID' });
        }
        const booking = await Booking.create({
            place,
            checkIn,
            checkOut,
            numberOfGuests,
            mobile,
            name,
            price,
            user: userData.id
        });
        response.status(201).json(booking);
    } catch (error) {
        console.error('Error creating booking:', error);
        response.status(500).json({ error: 'Internal Server Error' });
    }
});


bookingsRouter.post('/api/account/bookings/:bookingId/reviews', async (request, response) => {
    const {bookingId} = request.params;
    const userData = await getUserDataFromReq(request)
    const {ratings, average} = request.body
    await Review.create({user: userData.id, ratings, average, booking: bookingId})
    .then((doc) => {
        response.json(doc)
    })
    .catch((error) => { 
        console.error('Error creating review: ', error)
    })
})

bookingsRouter.get('/api/bookings', async (request, response) => {
    const userData = await getUserDataFromReq(request)
    response.json(await Booking.find({user: userData.id}).populate('place')) 
})

module.exports = bookingsRouter