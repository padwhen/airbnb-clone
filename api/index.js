const express = require('express')
const cors = require('cors')
const { default: mongoose } = require('mongoose')
const User = require('./models/User')
const bcrypt = require('bcryptjs')
const app = express()
const jwt = require('jsonwebtoken')
const cookieParser = require('cookie-parser')
const imageDownloader = require('image-downloader')
const path = require('path')
const multer = require('multer')
const fs = require('fs')
const Place = require('./models/Place')
const Booking = require('./models/Booking')

require('dotenv').config()
app.use(express.json())

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
app.use('/uploads', express.static(__dirname+'/uploads/'))

app.use(cors({
    credentials: true,
    origin: 'https://airbnb-clone-kknm.onrender.com'
}))

app.use(cookieParser())

mongoose.connect(process.env.MONGO_URL)

app.get('/test', (request, response) => {
    response.json('test ok')
})

app.post('/register', async (request, response) => {
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

app.post('/login', async (request, response) => {
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

app.get('/profile', (request, response) => {
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

app.post('/logout', (request, response) => {
    response.cookie('token', '').json(true)
})

app.post('/logout', (request, response) => {
    response.cookie('token','').json(true)
})

app.post('/upload-by-link', async (request, response) => {
    const {link} = request.body;
    const newName = 'photo' + Date.now() + '.jpg'
    const destPath = path.join(__dirname, 'uploads', newName);
    await imageDownloader.image({
        url: link,
        dest: destPath
    });
    response.json(newName)
})

const photosMiddleware = multer({dest: 'uploads/'})

app.post('/uploads', photosMiddleware.array('photos',100),(request, response) => {
    const uploadFiles = [];
    for (let i=0; i < request.files.length; i++) {
        const {path, originalname} = request.files[i]
        const parts = originalname.split('.')
        const ext = parts[parts.length - 1]
        const newPath = path + '.' + ext
        fs.renameSync(path, newPath)
        uploadFiles.push(newPath.replace('uploads\\',''))
    }
    response.json(uploadFiles)
});

app.post('/places', async (request, response) => {
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

app.get('/user-places', (request, response) => {
    const {token} = request.cookies
    jwt.verify(token, jwtSecret, {}, async (error, userData) => {
        const {id} = userData
        response.json( await Place.find({owner: id}))
    })
    
})

app.get('/places/:id', async (request, response) => {
    const {id} = request.params
    response.json(await Place.findById(id))
})

app.put('/places', async (request, response) => {
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

app.get('/places', async (request, response) => {
    response.json(await Place.find());
})

app.post('/booking', async (request, response) => {
    const userData = await getUserDataFromReq(request)
    const {place, checkIn, checkOut, numberOfGuests, mobile, name, price} = request.body
    Booking.create({place, checkIn, checkOut, numberOfGuests, mobile, name, price, user: userData.id})
    .then((doc) => {
        response.json(doc)
    })
    .catch((error) => {throw error})
})



app.get('/bookings', async (request, response) => {
    const userData = await getUserDataFromReq(request)
    response.json(await Booking.find({user: userData.id}).populate('place')) 
})

app.listen(process.env.PORT || 4000)

module.exports = app