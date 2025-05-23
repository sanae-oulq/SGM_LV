const mongoose = require('mongoose');

const retourDocumentSchema = new mongoose.Schema({
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
  retourId: {
    type: String,
    required: true
  },
  filePath: {
    type: String,
    required: true
  }
});

module.exports = mongoose.model('RetourDocument', retourDocumentSchema); 