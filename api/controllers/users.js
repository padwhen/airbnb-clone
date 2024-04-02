const express = require('express')
const usersRouter = express.Router()
const User = require('../models/User')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const {JWT_SECRET, BCRYPT_SALT} = require('../utils/config')

usersRouter.post('/api/register', async (request,response) => {
    const {name, email, password} = request.body
    try {
    const userDoc = await User.create({
        name,
        email,
        password:bcrypt.hashSync(password, BCRYPT_SALT),
    })
    response.json(userDoc)        
    } catch (e) {
        response.status(422).json(e)
    }
})

usersRouter.post('/api/login', async (request, response) => {
    const {email, password} = request.body
    const userDoc = await User.findOne({email})
    if (userDoc) {
        const passOk = bcrypt.compareSync(password, userDoc.password)
        if (passOk) {
            jwt.sign({email:userDoc.email, id:userDoc._id},JWT_SECRET, {}, (error, token) => {
                if (error) throw error;
                response.cookie('token',token).json(userDoc)
            })
        } else {
            response.status(422).json('password not ok')
        }
    } else {
        response.status(422).json('not found')
    }
})

usersRouter.get('/api/profile', async (request, response) => {
    try {
        const { token } = request.cookies;
        if (!token) {
            return response.status(500).json({ error: 'Token not found' });
        }
        jwt.verify(token, JWT_SECRET, {}, async (err, userData) => {
            if (err) {
                return response.status(500).json({ error: 'Invalid token' });
            }
            if (!userData || !userData.id) {
                return response.status(500).json({ error: 'Invalid user data in token' });
            }
            const user = await User.findById(userData.id);
            if (!user) {
                return response.status(500).json({ error: 'User not found' });
            }
            const { name, email, _id } = user;
            response.json({ name, email, _id });
        });
    } catch (error) {
        console.error('Error in /api/profile:', error);
        response.status(500).json({ error: 'Internal Server Error' });
    }
});



usersRouter.post('/api/logout', (request, response) => {
    response.cookie('token', '').json(true)
})


module.exports = usersRouter;