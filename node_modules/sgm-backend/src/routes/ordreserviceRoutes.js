const express = require('express');
const router = express.Router();
const ordreserviceController = require('../controllers/ordreserviceController');
const { upload } = require('../middleware/upload');

// Route pour créer un nouvel ordre de service
router.post('/', upload.single('fichier'), ordreserviceController.createOrderService);

// Route pour récupérer tous les ordres de service
router.get('/', ordreserviceController.getAllOrderServices);

// Route pour récupérer un ordre de service spécifique par numeroOS
router.get('/:numeroOS', ordreserviceController.getOrderServiceByNumero);

// Route pour mettre à jour un ordre de service par numeroOS
router.put('/:numeroOS', upload.single('fichier'), ordreserviceController.updateOrderServiceByNumero);

// Route pour supprimer un ordre de service par numeroOS
router.delete('/:numeroOS', ordreserviceController.deleteOrderServiceByNumero);

// Route pour télécharger un fichier
router.get('/:numeroOS/download', ordreserviceController.downloadFile);

module.exports = router;
