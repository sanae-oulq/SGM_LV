const express = require('express');
const router = express.Router();
const passationController = require('../controllers/passationController');

// Route pour créer une nouvelle passation
router.post('/create', passationController.createPassation);

// Route pour créer plusieurs passations
router.post('/multiple', passationController.createMultiplePassations);

// Route pour récupérer toutes les passations
router.get('/all', passationController.getAllPassations);

// Routes pour récupérer les passations par différents critères
router.get('/session/:sessionId', passationController.getPassationsBySession);
router.get('/marche/:marcheBC', passationController.getPassationsByMarche);
router.get('/service/:service', passationController.getPassationsByService);
router.get('/user/:utilisateur', passationController.getPassationsByUser);
router.get('/chaine/:codeChaine', passationController.getPassationsByChaine);
router.get('/periode/:debut/:fin', passationController.getPassationsByPeriode);

// Route pour récupérer une passation spécifique par ID
router.get('/:passationId', passationController.getPassationById);

// Routes pour mettre à jour une passation
router.put('/:passationId', passationController.updatePassation);
router.put('/:passationId/etat', passationController.updatePassationStatus);

// Route pour supprimer une passation
router.delete('/:passationId', passationController.deletePassation);



module.exports = router; 