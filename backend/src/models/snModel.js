const mongoose = require('mongoose');

const snSchema = new mongoose.Schema({
  sn: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  codeBarre: {
    type: String,
    required: true,
    trim: true
  },
  codeProduit: {
    type: String,
    required: true
  },
  marche: {
    type: String,
    required: true
  },
  idMarche: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Amarche',
    required: true
  },
  numeroPrix: {
    type: String,
    required: true
  },
  dateReception: {
    type: Date,
    required: true
  },
  finGarantie: {
    type: Date
  },
  receptionId: {
    type: String,
    required: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('SerialNumber', snSchema); 