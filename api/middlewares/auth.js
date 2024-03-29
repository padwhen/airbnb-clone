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

module.exports = getUserDataFromReq;
