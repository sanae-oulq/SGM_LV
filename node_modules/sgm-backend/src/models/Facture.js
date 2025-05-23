const mongoose = require('mongoose');

const factureSchema = new mongoose.Schema({
  numFacture: {
    type: String,
    required: true,
  },
  dateFacture: {
    type: Date,
    required: true,
  },
  montant: {
    type: Number,
    required: true,
  },
  bl: {
    type: String,
    required: true,
  },
  document: {
    filename: String,
    path: String,
    originalname: String,
    mimetype: String,
    size: Number,
  },
  marcheBC: {
    type: String,
    required: true,
  },
  marcheRef: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'AMarche',
    required: true,
  }
}, {
  timestamps: true,
});

module.exports = mongoose.model('Facture', factureSchema);
