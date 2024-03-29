const config = require('./utils/config')
const express = require('express')
const app = express()
const cors = require('cors')
const bookingsRouter = require('./controllers/bookings')
const placesRouter = require('./controllers/places')
const reviewsRouter = require('./controllers/reviews')
const usersRouter = require('./controllers/users')
const logger = require('./utils/logger')
const cookieParser = require('cookie-parser')
const mongoose = require('mongoose')
const middleware = require('./utils/middleware')

logger.info('connecting to', config.MONGODB_URL)

mongoose.connect(config.MONGODB_URL)
    .then(() => {
        logger.info('connected to MongoDB')
    })
    .catch((error) => {
        logger.error('error connecting to MongoDB:', error.message)
    })

app.use(cors({
        credentials: true,
        origin: 'http://localhost:8000'
}))

app.use(cookieParser());
app.use(express.json())

app.use(express.static('dist'))
app.use(middleware.requestLogger)

app.use('/', bookingsRouter)
app.use('/', placesRouter)
app.use('/', reviewsRouter)
app.use('/', usersRouter)

app.get('/api/test', (request, response) => {
    response.json('test ok')
})

app.use(middleware.unknownEndpoint)
app.use(middleware.errorHandler)

module.exports = app