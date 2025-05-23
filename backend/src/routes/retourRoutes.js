const express = require('express');
const router = express.Router();
const { 
    getAllRetours, 
    createMultipleRetours, 
    getRetoursByMarche,
    getRetourById,
    updateRetour, 
    deleteRetour 
} = require('../controllers/retourController');

// Route pour récupérer tous les retours
router.get('/all', getAllRetours);

// Route pour récupérer un retour par son retourId
router.get('/:retourId', getRetourById);

// Route pour récupérer les retours par marché
router.get('/', getRetoursByMarche);

// Route pour créer plusieurs retours en une seule requête
router.post('/multiple', createMultipleRetours);

// Route pour mettre à jour un retour
router.put('/:id', updateRetour);

// Route pour supprimer un retour
router.delete('/:id', deleteRetour);

module.exports = router; 