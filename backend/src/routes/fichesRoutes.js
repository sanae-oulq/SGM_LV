const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const { createFiches } = require('../controllers/fichesController');

// Configuration de multer pour le stockage des fichiers
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // Créer le dossier s'il n'existe pas
    const dir = path.join(__dirname, '../uploads/fiches');
    require('fs').mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // Limite de 5MB par fichier
  }
});

// Route pour créer une fiche avec upload de fichiers
router.post('/fiches', upload.fields([
  { name: 'ficheProjet', maxCount: 1 },
  { name: 'ficheAffectation', maxCount: 1 }
]), createFiches);

module.exports = router;
