const mongoose = require('mongoose')
const reviewSchema = new mongoose.Schema({
    user: {type:mongoose.Schema.Types.ObjectId, required: true, ref:'User'},
    booking: {type: mongoose.Schema.Types.ObjectId, required: true, ref: 'Booking'},
    ratings: {
        cleaniness: { type: Number, required: true, min: 1, max: 5},
        accuracy: { type: Number, required: true, min: 1, max: 5},
        location: { type: Number, required: true, min: 1, max: 5},
        checkIn: { type: Number, required: true, min: 1, max: 5},
        value: { type: Number, required: true, min: 1, max: 5},
        checkOut: { type: Number, required: true, min: 1, max: 5},
    },
    average: {type: Number, required: true}
})
const ReviewModel = mongoose.model('Review', reviewSchema)

module.exports = ReviewModel;