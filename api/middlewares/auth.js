const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../utils/config');

function getUserDataFromReq(request) {
    return new Promise((resolve, reject) => {
        jwt.verify(request.cookies.token, JWT_SECRET, {}, (error, userData) => {
            if (error) {
                reject(error);
            } else {
                resolve(userData);
            }
        });
    });
}

function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email);
}

function isValidPassword(password) {
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/
    return passwordRegex.test(password)
}

module.exports = getUserDataFromReq, isValidEmail, isValidPassword;
