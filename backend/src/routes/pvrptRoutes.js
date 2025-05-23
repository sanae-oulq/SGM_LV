const express = require('express');
const router = express.Router();
const pvrptController = require('../controllers/pvrptController');
const { upload } = require('../middleware/upload');

// Route pour créer un nouveau PVRPT
router.post('/', upload.single('document'), pvrptController.createPvrpt);

// Route pour récupérer tous les PVRPT
router.get('/', pvrptController.getAllPvrpts);

// Route pour récupérer un PVRPT spécifique par BL
router.get('/:BL', pvrptController.getPvrptByBL);

// Route pour mettre à jour un PVRPT par BL
router.put('/:BL', upload.single('document'), pvrptController.updatePvrptByBL);

// Route pour supprimer un PVRPT par BL
router.delete('/:BL', pvrptController.deletePvrptByBL);

// Route pour télécharger un fichier
router.get('/:BL/download', pvrptController.downloadFile);

module.exports = router;
