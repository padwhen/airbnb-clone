require('dotenv').config()
const bcrypt = require('bcryptjs')

const PORT = process.env.PORT
const MONGODB_URL = process.env.NODE_ENV === 'test' 
    ? process.env.TEST_MONGO_URL 
    : process.env.MONGO_URL

const JWT_SECRET = "randomstring"
const BCRYPT_SALT = bcrypt.genSaltSync(10)

module.exports = {
    PORT, MONGODB_URL, JWT_SECRET, BCRYPT_SALT
}