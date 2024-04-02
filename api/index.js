const express = require('express')
const cors = require('cors')
const { default: mongoose } = require('mongoose')
const User = require('./models/User')
const bcrypt = require('bcryptjs')
const app = require('./app')
const jwt = require('jsonwebtoken')
const cookieParser = require('cookie-parser')
const config = require('./utils/config')
const logger = require('./utils/logger')

app.listen(config.PORT, () => {
    logger.info(`Server running on port ${config.PORT}`)
})
