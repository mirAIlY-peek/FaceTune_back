// src/config/index.js
const dotenv = require('dotenv');
dotenv.config();

module.exports = {
    PORT: process.env.PORT || 3000,
    SUNO_COOKIE: process.env.SUNO_COOKIE,
};
