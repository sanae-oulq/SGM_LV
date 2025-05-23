const mongoose = require('mongoose');

const marcheDocumentSchema = new mongoose.Schema({
  marcheBC: {
    type: String,
    required: true,
    ref: 'AMarche'
  },
  fileName: {
    type: String,
    required: true
  },
  filePath: {
    type: String,
    required: true
  },
  fileType: {
    type: String,
    required: true
  },
  uploadDate: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

marcheDocumentSchema.index({ marcheBC: 1 });

module.exports = mongoose.model('MarcheDocument', marcheDocumentSchema);