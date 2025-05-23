const express = require('express');
const router = express.Router();
const { createAMarche, getAllAMarches, getAMarcheByMarcheBC, deleteAMarcheByMarcheBC, updateAMarcheByMarcheBC, updateDetailsPrix } = require('../controllers/amarcheController');

router.post('/', createAMarche);

router.get('/', getAllAMarches);

router.get('/:marcheBC', getAMarcheByMarcheBC);

router.put('/:marcheBC', updateAMarcheByMarcheBC);

router.delete('/:marcheBC', deleteAMarcheByMarcheBC);

// Nouvelle route pour mettre à jour les detailsPrix d'un detailProjet spécifique
router.put('/:marcheBC/detailProjet/:numeroPrix/detailsPrix', updateDetailsPrix);

module.exports = router;