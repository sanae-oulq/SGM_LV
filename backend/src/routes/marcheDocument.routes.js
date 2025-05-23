const express = require('express');
const router = express.Router();
const marcheDocumentController = require('../controllers/marcheDocument.controller');

// Route pour l'upload de fichiers
router.post('/upload', marcheDocumentController.uploadFile);

// Route pour récupérer les fichiers d'un marché
router.get('/marche/:marcheBC', marcheDocumentController.getFilesByMarcheBC);

// Route pour télécharger un fichier
router.get('/download/:id', marcheDocumentController.downloadFile);

module.exports = router;