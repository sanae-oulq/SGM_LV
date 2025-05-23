const express = require('express');
const router = express.Router();
const { uploadAffecDocument } = require('../middleware/uploads');
const affecDocumentController = require('../controllers/affecDocumentController');

// Routes pour les documents
router.post('/upload', uploadAffecDocument.single('file'), affecDocumentController.uploadDocument);
router.get('/affectation/:affectationId', affecDocumentController.getDocumentsByAffectation);
router.get('/download/:id', affecDocumentController.downloadDocument);
router.delete('/:id', affecDocumentController.deleteDocument);

module.exports = router; 