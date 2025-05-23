const mongoose = require('mongoose');

const recepDocumentsSchema = new mongoose.Schema({
  fileName: {
    type: String,
    required: true
  },
  fileData: {
    type: Buffer,
    required: true
  },
  typeFile: {
    type: String,
    required: true
  },
  description: {
    type: String
  },
  date: {
    type: Date,
    default: Date.now
  },
  receptionId: {
    type: String,
    required: true
  }
});

module.exports = mongoose.model('RecepDocuments', recepDocumentsSchema); 