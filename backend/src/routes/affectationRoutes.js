const express = require('express');
const router = express.Router();
const { createAffectation, createMultipleAffectations, getAffectationsByMarche, getAllAffectations, updateAffectationEtat } = require('../controllers/affectationController');

// Route pour récupérer toutes les affectations
router.get('/all', getAllAffectations);

// Route pour récupérer les affectations par marché
router.get('/', getAffectationsByMarche);

// Route pour créer une nouvelle affectation
router.post('/', createAffectation);

// Route pour créer plusieurs affectations en une seule requête
router.post('/multiple', createMultipleAffectations);

// Route pour mettre à jour l'état d'une affectation
router.put('/:sn/etat', updateAffectationEtat);

module.exports = router; 