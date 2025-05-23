const mongoose = require('mongoose');

const retourSchema = new mongoose.Schema({
    retourId: {
        type: String,
        required: true
    },
    dateRetour: {
        type: Date,
        required: true,
        validate: {
            validator: function(value) {
                return !isNaN(Date.parse(value));
            },
            message: 'La date de retour doit être une date valide'
        }
    },
    marcheBC: {
        type: String,
        required: true
    },
    idMarche: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'AMarche',
        required: true
    },
    numPrix: {
        type: String,
        required: true
    },
    snReception: {
        type: String,
        required: true
    },
    codeBarre: {
        type: String,
        required: true
    },
    codeChaine: {
        type: String,
        required: true
    },
    nomChaine: {
        type: String,
        required: true
    },
    service: {
        type: String,
        required: true
    },
    utilisateur: {
        type: String,
        required: true
    },
    responsable: {
        type: String,
        required: false
    },
    memo: {
        type: String,
        required: false
    },
    etat: {
        type: String,
        enum: ['rendu', 'non rendu'],
        required: true
    },
    affectationId: {
        type: String,
        required: true
    }
}, {
    timestamps: true
});

// Indexation pour optimisation des requêtes
retourSchema.index({ retourId: 1 });
retourSchema.index({ dateRetour: 1 });
retourSchema.index({ marcheBC: 1 });
retourSchema.index({ snReception: 1 });
retourSchema.index({ service: 1 });
retourSchema.index({ utilisateur: 1 });
retourSchema.index({ responsable: 1 });
retourSchema.index({ affectationId: 1 });

const Retour = mongoose.model('Retour', retourSchema);

module.exports = Retour; 