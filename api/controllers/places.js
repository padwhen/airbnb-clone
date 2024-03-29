const express = require('express');
const placesRouter = express.Router();
const Place = require('../models/Place');
const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../utils/config');

placesRouter.post('/api/places', async (request, response) => {
    try {
        const { token } = request.cookies;
        const { title, address, addedPhotos, description, perks, extraInfo, checkIn, checkOut, maxGuests, price } = request.body;
        const userData = jwt.verify(token, JWT_SECRET);
        const placeDoc = await Place.create({
            owner: userData.id,
            title, address, photos: addedPhotos, description, perks, extraInfo, checkIn, checkOut, maxGuests, price
        });
        response.json(placeDoc);
    } catch (error) {
        response.status(500).json({ error: 'Internal Server Error' });
    }
});

placesRouter.get('/api/user-places', async (request, response) => {
    try {
        const { token } = request.cookies;
        const userData = jwt.verify(token, JWT_SECRET);
        const places = await Place.find({ owner: userData.id });
        response.json(places);
    } catch (error) {
        response.status(500).json({ error: 'Internal Server Error' });
    }
});

placesRouter.get('/api/places/:id', async (request, response) => {
    try {
        const { id } = request.params;
        const place = await Place.findById(id);
        response.json(place);
    } catch (error) {
        response.status(500).json({ error: 'Internal Server Error' });
    }
});

placesRouter.put('/api/places', async (request, response) => {
    try {
        const { token } = request.cookies;
        const { id, title, address, addedPhotos, description, perks, extraInfo, checkIn, checkOut, maxGuests, price } = request.body;
        const userData = jwt.verify(token, JWT_SECRET);
        const placeDoc = await Place.findById(id);
        if (userData.id === placeDoc.owner.toString()) {
            placeDoc.set({
                title, address, photos: addedPhotos, description, perks, extraInfo, checkIn,
                checkOut, maxGuests, price
            });
            await placeDoc.save();
            response.json('Success');
        } else {
            response.status(403).json({ error: 'Unauthorized' });
        }
    } catch (error) {
        response.status(500).json({ error: 'Internal Server Error' });
    }
});

placesRouter.get('/api/places', async (request, response) => {
    try {
        const places = await Place.find();
        response.json(places);
    } catch (error) {
        response.status(500).json({ error: 'Internal Server Error' });
    }
});

module.exports = placesRouter;
