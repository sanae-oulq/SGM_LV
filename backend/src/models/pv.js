const mongoose = require('mongoose');

const pvSchema = new mongoose.Schema({
  date: {
    type: Date,
    required: true
  },
  marcheBC: {
    type: String,
    required: true
  },
  marcheBCType: {
    type: String,
    enum: ['marche', 'bc'],
    required: true
  },
  type: {
    type: String,
    enum: ['provisoire', 'definitif'],
    required: true
  },
  fichier: {
    filename: String,
    originalname: String,
    path: String
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('PV', pvSchema); 