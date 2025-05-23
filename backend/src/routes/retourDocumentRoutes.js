const express = require('express');
const router = express.Router();
const { uploadRetourDocument } = require('../middleware/uploads');
const retourDocumentController = require('../controllers/retourDocumentController');

// Routes pour les documents
router.post('/upload', uploadRetourDocument.single('file'), retourDocumentController.uploadDocument);
router.get('/retour/:retourId', retourDocumentController.getDocumentsByRetour);
router.get('/download/:id', retourDocumentController.downloadDocument);
router.delete('/:id', retourDocumentController.deleteDocument);

module.exports = router; 