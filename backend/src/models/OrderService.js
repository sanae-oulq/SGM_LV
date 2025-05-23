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
        marcheBC: {
        type: String,
        required: true,
    },
    marcheRef: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'AMarche',
        required: true,
    },
    fichier: {
        filename: {
            type: String,
            default: 'Aucun'
        },
        path: {
            type: String,
            default: ''
        }
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('OrderService', orderServiceSchema); 