const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const PVProvisoire = require('../models/pvProvisoire');
const PVDefinitif = require('../models/pvDefinitif');
const { handleMulterError } = require('../middleware/upload');

// Configuration de multer pour le stockage des fichiers
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = 'uploads/pv';
    // Créer le dossier s'il n'existe pas
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ storage: storage });

// Routes pour PV Provisoire
router.post('/provisoire', upload.single('ficheProjet'), async (req, res) => {
  try {
    const { date, marcheBC, marcheBCType } = req.body;
    const fichier = req.file;

    if (!date || !marcheBC || !fichier) {
      return res.status(400).json({ message: 'Tous les champs sont requis' });
    }

    const pvProvisoire = new PVProvisoire({
      date,
      marcheBC,
      marcheBCType,
      fichier: {
        filename: fichier.filename,
        originalname: fichier.originalname,
        path: fichier.path
      }
    });

    const savedPv = await pvProvisoire.save();

    res.status(201).json({
      message: 'PV provisoire créé avec succès',
      data: savedPv
    });
  } catch (error) {
    console.error('Erreur lors de la création du PV provisoire:', error);
    res.status(500).json({ message: 'Erreur lors de la création du PV provisoire' });
  }
});

router.get('/provisoire', async (req, res) => {
  try {
    const pvs = await PVProvisoire.find();
    res.json(pvs);
  } catch (error) {
    console.error('Erreur lors de la récupération des PV provisoires:', error);
    res.status(500).json({ message: 'Erreur lors de la récupération des PV provisoires' });
  }
});

router.get('/provisoire/:id', async (req, res) => {
  try {
    const pv = await PVProvisoire.findById(req.params.id);
    if (!pv) {
      return res.status(404).json({ message: 'PV provisoire non trouvé' });
    }
    res.json(pv);
  } catch (error) {
    console.error('Erreur lors de la récupération du PV provisoire:', error);
    res.status(500).json({ message: 'Erreur lors de la récupération du PV provisoire' });
  }
});

// Routes pour PV Définitif
router.post('/definitif', upload.single('ficheProjet'), async (req, res) => {
  try {
    const { date, marcheBC, marcheBCType } = req.body;
    const fichier = req.file;

    if (!date || !marcheBC || !fichier) {
      return res.status(400).json({ message: 'Tous les champs sont requis' });
    }

    const pvDefinitif = new PVDefinitif({
      date,
      marcheBC,
      marcheBCType,
      fichier: {
        filename: fichier.filename,
        originalname: fichier.originalname,
        path: fichier.path
      }
    });

    const savedPv = await pvDefinitif.save();

    res.status(201).json({
      message: 'PV définitif créé avec succès',
      data: savedPv
    });
  } catch (error) {
    console.error('Erreur lors de la création du PV définitif:', error);
    res.status(500).json({ message: 'Erreur lors de la création du PV définitif' });
  }
});

router.get('/definitif', async (req, res) => {
  try {
    const pvs = await PVDefinitif.find();
    res.json(pvs);
  } catch (error) {
    console.error('Erreur lors de la récupération des PV définitifs:', error);
    res.status(500).json({ message: 'Erreur lors de la récupération des PV définitifs' });
  }
});

router.get('/definitif/:id', async (req, res) => {
  try {
    const pv = await PVDefinitif.findById(req.params.id);
    if (!pv) {
      return res.status(404).json({ message: 'PV définitif non trouvé' });
    }
    res.json(pv);
  } catch (error) {
    console.error('Erreur lors de la récupération du PV définitif:', error);
    res.status(500).json({ message: 'Erreur lors de la récupération du PV définitif' });
  }
});

// Routes pour téléchargement des fichiers
router.get('/provisoire/download/:id', async (req, res) => {
  try {
    const pv = await PVProvisoire.findById(req.params.id);
    if (!pv || !pv.fichier) {
      return res.status(404).json({ message: 'Fichier PV provisoire non trouvé' });
    }

    const filePath = path.join(__dirname, '../../', pv.fichier.path);
    res.download(filePath, pv.fichier.originalname);
  } catch (error) {
    console.error('Erreur lors du téléchargement du fichier:', error);
    res.status(500).json({ message: 'Erreur lors du téléchargement du fichier' });
  }
});

router.get('/definitif/download/:id', async (req, res) => {
  try {
    const pv = await PVDefinitif.findById(req.params.id);
    if (!pv || !pv.fichier) {
      return res.status(404).json({ message: 'Fichier PV définitif non trouvé' });
    }

    const filePath = path.join(__dirname, '../../', pv.fichier.path);
    res.download(filePath, pv.fichier.originalname);
  } catch (error) {
    console.error('Erreur lors du téléchargement du fichier:', error);
    res.status(500).json({ message: 'Erreur lors du téléchargement du fichier' });
  }
});

module.exports = router; 