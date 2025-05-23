const mongoose = require('mongoose');

const passationDocumentSchema = new mongoose.Schema({
  passationId: {
    type: String,
    required: true
  },
  fileName: {
    type: String,
    required: true
  },
  typeFile: {
    type: String,
    required: true
  },
  date: {
    type: Date,
    default: Date.now
  },
  description: {
    type: String
  },
  filePath: {
    type: String,
    required: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('PassationDocument', passationDocumentSchema); 