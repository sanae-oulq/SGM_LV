const mongoose = require('mongoose');

const affectationSchema = new mongoose.Schema({
  affectationId: {
    type: String,
    required: true,
    unique: true
  },
  dateAffectation: {
    type: Date,
    required: true
  },
  typeAffectation: {
    type: String,
    required: true,
    enum: ['Definitive', 'Provisoire']
  },
  idMarche: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'AMarche',
    required: true
  },
  marcheBC: {
    type: String,
    required: true
  },
  numPrix: {
    type: String,
    required: true
  },
  numReception: {
    type: String
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
  lieu: String,
  evenement: String,
  qualite: String,
  memo: String,
  etat: {
    type: String,
    enum: ['Affecté', 'Non affecté'],
    required: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Affectation', affectationSchema); 