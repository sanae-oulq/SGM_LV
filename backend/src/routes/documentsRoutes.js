const express = require('express');
const router = express.Router();
const documentsController = require('../controllers/documentsController');
const { uploadDocument, uploadBRI, handleUploadError } = require('../middleware/uploads');

// Routes pour les documents généraux
router.post('/upload', uploadDocument, handleUploadError, documentsController.uploadDocument);
router.get('/reception/:receptionId', documentsController.getDocumentsByReceptionId);
router.delete('/:id', documentsController.deleteDocument);
router.get('/download/:id', documentsController.downloadDocument);

// Routes pour les BRI
router.post('/uploadBRI', uploadBRI, handleUploadError, documentsController.uploadBRI);
router.get('/bri/reception/:receptionId', documentsController.getBRIByReceptionId);
router.delete('/bri/:id', documentsController.deleteBRI);
router.get('/bri/download/:id', documentsController.downloadBRI);

module.exports = router; 