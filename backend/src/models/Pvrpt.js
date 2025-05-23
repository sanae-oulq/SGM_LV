const mongoose = require('mongoose');

const pvrptSchema = new mongoose.Schema({
  datePVRPT: {
    type: Date,
    required: true,
  },
  BL: {
    type: String,
    required: true,
  },
  avecReserve: {
    type: Boolean,
    default: false,
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

module.exports = mongoose.model('Pvrpt', pvrptSchema);
