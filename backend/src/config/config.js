require('dotenv').config();

module.exports = {
    mongoURI: process.env.MONGODB_URI || 'mongodb://localhost:27017/sgm',
    jwtSecret: process.env.JWT_SECRET || 'votre_secret_jwt',
    port: process.env.PORT || 5000
}; 