const express = require('express');
const router = express.Router();
const snController = require('../controllers/snController');

// Route pour vérifier si un SN existe (nouvelle route)
router.get('/check/:sn', snController.checkSN);

// Route pour récupérer tous les SN
router.get('/', snController.getAllSN);

// Route pour récupérer les SN par marché
router.get('/marche/:idMarche', snController.getSNByMarche);

// Route pour récupérer un SN spécifique
router.get('/:sn', snController.getSN);

// Route pour créer un nouveau SN
router.post('/', snController.createSN);

module.exports = router; 