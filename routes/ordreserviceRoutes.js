const express = require('express');
const router = express.Router();
const ordreserviceController = require('../controllers/ordreserviceController');

// Route pour créer un nouvel ordre de service
router.post('/', ordreserviceController.createOrderService);

// Route pour récupérer tous les ordres de service
router.get('/', ordreserviceController.getAllOrderServices);

// Route pour récupérer un ordre de service spécifique
router.get('/:id', ordreserviceController.getOrderServiceById);

// Route pour mettre à jour un ordre de service
router.put('/:id', ordreserviceController.updateOrderService);

// Route pour supprimer un ordre de service
router.delete('/:id', ordreserviceController.deleteOrderService);

module.exports = router; 