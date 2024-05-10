const express = require('express')
const usersRouter = express.Router()
const User = require('../models/User')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const {JWT_SECRET, BCRYPT_SALT} = require('../utils/config')

usersRouter.post('/api/register', async (request,response) => {
    const {name, email, password} = request.body
    try {
        if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/.test(password)) {
            throw new Error('Password does not meet criteria. It must contain at least one uppercase letter, one lowercase letter, one number, one special character, and be 8-20 characters long')
        }
        const hashedPassword = bcrypt.hashSync(password, BCRYPT_SALT)
        const userDoc = await User.create({
            name,
            email,
            password: hashedPassword,
        })
        response.json(userDoc)        
        } catch (e) {
        if (e.code === 11000) {
            response.status(422).json({ message: 'Email is already registered. Please use a different email.' });
        } else if (e.name === 'ValidationError' && e.errors && e.errors.password) {
            response.status(422).json({ message: e.errors.password.message });
        } else {
            response.status(422).json({ message: e.message });
        }
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