const MarcheDocument = require('../models/MarcheDocument');
const AMarche = require('../models/AMarche');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Obtenir le chemin absolu du dossier uploads
const uploadDir = path.join(__dirname, '../../uploads/marcheDocuments');

// S'assurer que le dossier existe
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Configuration du stockage multer
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    // Créer un nom de fichier unique avec la date et le nom original
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + '-' + file.originalname);
  }
});

const upload = multer({
  storage: storage,
  fileFilter: function (req, file, cb) {
    const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (!allowedTypes.includes(file.mimetype)) {
      return cb(new Error('Type de fichier non supporté'));
    }
    cb(null, true);
  }
}).single('file');

// Contrôleurs
exports.uploadFile = async (req, res) => {
  upload(req, res, async function (err) {
    if (err) {
      return res.status(400).json({ message: err.message });
    }

    if (!req.file) {
      return res.status(400).json({ message: 'Aucun fichier n\'a été uploadé' });
    }

    const { marcheBC } = req.body;
    if (!marcheBC) {
      return res.status(400).json({ message: 'Le code marché est requis' });
    }

    try {
      console.log('Recherche du marché avec le code:', marcheBC);
      
      // Vérifier si le marché existe
      const marche = await AMarche.findOne({ marcheBC: marcheBC });
      console.log('Résultat de la recherche:', marche);

      if (!marche) {
        // Essayer avec le champ 'marche' si 'marcheBC' ne fonctionne pas
        const marcheAlt = await AMarche.findOne({ marche: marcheBC });
        console.log('Résultat de la recherche alternative:', marcheAlt);
        
        if (!marcheAlt) {
          return res.status(404).json({ 
            message: 'Marché non trouvé',
            details: `Aucun marché trouvé avec le code ${marcheBC}`
          });
        }
      }

      // Créer le document avec le chemin relatif pour la base de données
      const document = new MarcheDocument({
        marcheBC: marcheBC,
        fileName: req.file.originalname,
        filePath: path.join('uploads/marcheDocuments', req.file.filename),
        fileType: req.file.mimetype
      });

      await document.save();

      res.status(200).json({
        message: 'Fichier uploadé avec succès',
        document: document
      });
    } catch (error) {
      console.error('Erreur lors de l\'upload:', error);
      // Si une erreur se produit, supprimer le fichier uploadé
      if (req.file) {
        fs.unlinkSync(req.file.path);
      }
      res.status(500).json({ 
        message: 'Erreur lors de l\'upload du fichier',
        error: error.message 
      });
    }
  });
};

exports.getFilesByMarcheBC = async (req, res) => {
  try {
    const { marcheBC } = req.params;
    
    // Vérifier si le marché existe
    const marche = await AMarche.findOne({ marcheBC: marcheBC });
    if (!marche) {
      return res.status(404).json({ message: 'Marché non trouvé' });
    }

    const files = await MarcheDocument.find({ marcheBC: marcheBC })
      .sort({ uploadDate: -1 });

    res.status(200).json(files);
  } catch (error) {
    res.status(500).json({ 
      message: 'Erreur lors de la récupération des fichiers',
      error: error.message 
    });
  }
};

exports.downloadFile = async (req, res) => {
  try {
    const { id } = req.params;
    const file = await MarcheDocument.findById(id);

    if (!file) {
      return res.status(404).json({ message: 'Fichier non trouvé' });
    }

    res.download(file.filePath, file.fileName);
  } catch (error) {
    res.status(500).json({ 
      message: 'Erreur lors du téléchargement du fichier',
      error: error.message 
    });
  }
};