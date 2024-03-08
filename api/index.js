const express = require('express')
const cors = require('cors')
const { default: mongoose } = require('mongoose')
const User = require('./models/User')
const bcrypt = require('bcryptjs')
const app = express()
const jwt = require('jsonwebtoken')
const cookieParser = require('cookie-parser')

const Place = require('./models/Place')
const Booking = require('./models/Booking')
const Review = require('./models/Review')

require('dotenv').config()
app.use(express.json())

app.use(express.static('dist'))

const bcryptSalt = bcrypt.genSaltSync(10)
const jwtSecret = 'randomstring'

function getUserDataFromReq(request) {
    return new Promise((resolve, reject) => {
        jwt.verify(request.cookies.token, jwtSecret, {}, async (error, userData) => {
        if (error) throw error
        resolve(userData);
    }) 
    })
}

app.use(cookieParser());

app.use(cors({
    credentials: true,
    origin: 'http://localhost:8000'
}))

app.use(cookieParser())

mongoose.connect(process.env.MONGO_URL)

app.get('/api/test', (request, response) => {
    response.json('test ok')
})

app.post('/api/register', async (request, response) => {
    const {name, email, password} = request.body
    try {
    const userDoc = await User.create({
        name,
        email,
        password:bcrypt.hashSync(password, bcryptSalt),
    })
    response.json(userDoc)        
    } catch (e) {
        response.status(422).json(e)
    }

})

app.post('/api/login', async (request, response) => {
    const {email, password} = request.body
    const userDoc = await User.findOne({email})
    if (userDoc) {
        const passOk = bcrypt.compareSync(password, userDoc.password)
        if (passOk) {
            jwt.sign({email:userDoc.email, id:userDoc._id},jwtSecret, {}, (error, token) => {
                if (error) throw error;
                response.cookie('token',token).json(userDoc)
            })
        } else {
            response.status(422).json('password not ok')
        }
    } else {
        response.json('not found')
    }
})

app.get('/api/profile', (request, response) => {
    const {token} = request.cookies
    if (token) {
        jwt.verify(token, jwtSecret, {}, async (err, userData) => {
            if (err) throw err
            const {name, email, _id} = await User.findById(userData.id)
            response.json({name,email,_id})
        })
    } else {
        response.json(null)
    }
})

app.post('/api/logout', (request, response) => {
    response.cookie('token', '').json(true)
})

app.post('/api/logout', (request, response) => {
    response.cookie('token','').json(true)
})
app.post('/api/places', async (request, response) => {
    const {token} = request.cookies;
    const {title, address, addedPhotos, 
        description, perks, extraInfo, checkIn, checkOut, maxGuests, price} = request.body;
    jwt.verify(token, jwtSecret, {}, async (error, userData) => {
        if (error) throw error;
        const placeDoc = await Place.create({
            owner: userData.id,
            title, address, photos: addedPhotos, description, perks, extraInfo, checkIn, checkOut, maxGuests, price
        })
        response.json(placeDoc)
    })
})

app.get('/api/user-places', (request, response) => {
    const {token} = request.cookies
    jwt.verify(token, jwtSecret, {}, async (error, userData) => {
        const {id} = userData
        response.json( await Place.find({owner: id}))
    })
    
})

app.get('/api/places/:id', async (request, response) => {
    const {id} = request.params
    response.json(await Place.findById(id))
})

app.put('/api/places', async (request, response) => {
    const {token} = request.cookies;
    const {id, title, address, addedPhotos, 
        description, perks, extraInfo, checkIn, checkOut, maxGuests, price} = request.body;
    jwt.verify(token, jwtSecret, {}, async (error, userData) => {
        if (error) throw error;
        const placeDoc = await Place.findById(id);
        if (userData.id === placeDoc.owner.toString()) {
            placeDoc.set({
                title, address, photos: addedPhotos, description, perks, extraInfo, checkIn, 
                checkOut, maxGuests, price
            })
            await placeDoc.save()
            response.json('ok')
        }
    })
})

app.get('/api/places', async (request, response) => {
    response.json(await Place.find());
})

app.post('/api/booking', async (request, response) => {
    const userData = await getUserDataFromReq(request)
    const {place, checkIn, checkOut, numberOfGuests, mobile, name, price} = request.body
    Booking.create({place, checkIn, checkOut, numberOfGuests, mobile, name, price, user: userData.id})
    .then((doc) => {
        response.json(doc)
    })
    .catch((error) => {throw error})
})

app.post('/api/account/bookings/:bookingId/reviews', async (request, response) => {
    const {bookingId} = request.params;
    const userData = await getUserDataFromReq(request)
    const {ratings, average} = request.body
    Review.create({user: userData.id, ratings, average, booking: bookingId})
    .then((doc) => {
        response.json(doc)
    })
    .catch((error) => { 
        console.error('Error creating review: ', error)
    })
})

app.get('/api/account/bookings/:bookingId/reviews', async (request, response) => {
    try {
        const {bookingId} = request.params
        const review = await Review.find({ booking: bookingId })
        response.json(review)
    } catch (error) {
        console.error('Error fetching reviews: ', error)    
        response.status(500).json({ error: 'Internal Server Error '})
    }
})

app.get('/api/bookings', async (request, response) => {
    const userData = await getUserDataFromReq(request)
    response.json(await Booking.find({user: userData.id}).populate('place')) 
})

app.get('/api/places/:placeId/reviews-in-this-place', async (request, response) => {
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

app.listen(process.env.PORT || 4000)

module.exports = app