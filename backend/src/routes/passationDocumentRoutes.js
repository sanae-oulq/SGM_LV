const express = require('express');
const router = express.Router();
const { uploadPassationDocument } = require('../middleware/uploads');
const passationDocumentController = require('../controllers/passationDocumentController');

// Routes pour les documents
router.post('/upload', uploadPassationDocument, passationDocumentController.uploadDocument);
router.get('/passation/:passationId', passationDocumentController.getDocumentsByPassationId);
router.get('/download/:id', passationDocumentController.downloadDocument);
router.delete('/:id', passationDocumentController.deleteDocument);

module.exports = router; 