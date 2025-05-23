const mongoose = require('mongoose');

const orderServiceSchema = new mongoose.Schema({
    numeroOS: {
        type: String,
        required: true,
        unique: true
    },
    dateOS: {
        type: Date,
        required: true
    },
    typeOS: {
        type: String,
        required: true,
        enum: ['Premier OS', 'Arret', 'Reprise', 'Autres']
    },
    fichier: {
        type: String,
        default: 'Aucun'
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('OrderService', orderServiceSchema); 