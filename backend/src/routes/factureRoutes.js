const express = require('express');
const router = express.Router();
const factureController = require('../controllers/factureController');
const { upload, handleMulterError } = require('../middleware/upload');

// Route pour créer une nouvelle facture
router.post('/', upload.single('document'), factureController.createFacture);

// Route pour récupérer toutes les factures
router.get('/', factureController.getAllFactures);

// Route pour récupérer une facture spécifique par numéro
router.get('/:numFacture', factureController.getFactureByNum);

// Route pour mettre à jour une facture par numéro
router.put('/:numFacture', upload.single('document'), factureController.updateFactureByNum);

// Route pour supprimer une facture par numéro
router.delete('/:numFacture', factureController.deleteFactureByNum);

// Route pour télécharger un fichier
router.get('/:numFacture/download', factureController.downloadFile);

// Add error handling middleware
router.use(handleMulterError);

module.exports = router;
