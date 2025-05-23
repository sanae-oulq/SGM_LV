const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const attestationConformiteController = require('../controllers/attestationConformiteController');

// Configuration de multer pour l'upload des fichiers
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, '../../uploads/attestations'));
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'attestation-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ storage: storage });

// Routes
router.post('/upload', upload.single('file'), attestationConformiteController.upload);
router.get('/marche/:marcheBC', attestationConformiteController.getByMarcheBC);
router.get('/:id', attestationConformiteController.getById);
router.get('/:id/download', attestationConformiteController.download);

module.exports = router; 