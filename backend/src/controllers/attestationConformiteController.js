const AttestationConformite = require('../models/AttestationConformite');
const AMarche = require('../models/AMarche');
const fs = require('fs');
const path = require('path');

// Configuration du dossier d'upload
const uploadDir = path.join(__dirname, '../../uploads/attestations');

// Créer le dossier s'il n'existe pas
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const attestationConformiteController = {
  // Upload une nouvelle attestation
  upload: async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: 'Aucun fichier n\'a été uploadé' });
      }

      if (!req.body.marcheBC) {
        return res.status(400).json({ message: 'Le numéro de marché/BC est requis' });
      }

      // Vérifier si le marché existe
      const marche = await AMarche.findOne({ marcheBC: req.body.marcheBC });
      if (!marche) {
        return res.status(404).json({ message: 'Marché non trouvé' });
      }

      const attestation = new AttestationConformite({
        filename: req.file.filename,
        path: req.file.path,
        originalname: req.file.originalname,
        mimetype: req.file.mimetype,
        size: req.file.size,
        marcheBC: req.body.marcheBC,
        marcheRef: marche._id
      });

      await attestation.save();

      res.status(201).json({
        message: 'Attestation de conformité uploadée avec succès',
        attestation
      });
    } catch (error) {
      console.error('Erreur lors de l\'upload de l\'attestation:', error);
      res.status(500).json({ message: 'Erreur lors de l\'upload de l\'attestation' });
    }
  },

  // Récupérer les attestations par marcheBC
  getByMarcheBC: async (req, res) => {
    try {
      const attestations = await AttestationConformite.find({ marcheBC: req.params.marcheBC })
        .sort({ uploadDate: -1 }); // Tri par date d'upload décroissante
      res.json(attestations);
    } catch (error) {
      console.error('Erreur lors de la récupération des attestations:', error);
      res.status(500).json({ message: 'Erreur lors de la récupération des attestations' });
    }
  },

  // Récupérer une attestation par son ID
  getById: async (req, res) => {
    try {
      const attestation = await AttestationConformite.findById(req.params.id)
        .populate('marcheRef', 'marcheBC');
      if (!attestation) {
        return res.status(404).json({ message: 'Attestation non trouvée' });
      }
      res.json(attestation);
    } catch (error) {
      console.error('Erreur lors de la récupération de l\'attestation:', error);
      res.status(500).json({ message: 'Erreur lors de la récupération de l\'attestation' });
    }
  },

  // Télécharger une attestation
  download: async (req, res) => {
    try {
      const attestation = await AttestationConformite.findById(req.params.id);
      if (!attestation) {
        return res.status(404).json({ message: 'Attestation non trouvée' });
      }

      res.download(attestation.path, attestation.originalname);
    } catch (error) {
      console.error('Erreur lors du téléchargement de l\'attestation:', error);
      res.status(500).json({ message: 'Erreur lors du téléchargement de l\'attestation' });
    }
  }
};

module.exports = attestationConformiteController; 