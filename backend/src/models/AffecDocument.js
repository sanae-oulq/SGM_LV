const mongoose = require('mongoose');

const affecDocumentSchema = new mongoose.Schema({
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
  affectationId: {
    type: String,
    required: true
  },
  filePath: {
    type: String,
    required: true
  }
});

module.exports = mongoose.model('AffecDocument', affecDocumentSchema); 