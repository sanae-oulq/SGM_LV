const mongoose = require('mongoose');

const attestationConformiteSchema = new mongoose.Schema({
  filename: {
    type: String,
    required: true
  },
  path: {
    type: String,
    required: true
  },
  originalname: {
    type: String,
    required: true
  },
  mimetype: {
    type: String,
    required: true
  },
  size: {
    type: Number,
    required: true
  },
  uploadDate: {
    type: Date,
    default: Date.now
  },
  marcheBC: {
    type: String,
    required: true
  },
  marcheRef: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'AMarche',
    required: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('AttestationConformite', attestationConformiteSchema); 