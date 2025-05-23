const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Créer les dossiers s'ils n'existent pas
const createUploadDirs = () => {
  const dirs = [
    path.join(__dirname, '../../uploads/recepDocument'),
    path.join(__dirname, '../../uploads/recepBri'),
    path.join(__dirname, '../../uploads/affecDocument'),
    path.join(__dirname, '../../uploads/retourDocument'),
    path.join(__dirname, '../../uploads/affectations'),
    path.join(__dirname, '../../uploads/retours'),
    path.join(__dirname, '../../uploads/passations'),
    path.join(__dirname, '../../uploads/passationDocument'),
    path.join(__dirname, '../../uploads/marcheDocument') // Ajout ici
  ];
  
  dirs.forEach(dir => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  });
};

// Créer les dossiers au démarrage
createUploadDirs();

// Filtre pour les types de fichiers autorisés
const fileFilter = (req, file, cb) => {
  const allowedTypes = [
    'image/jpeg',
    'image/png',
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  ];

  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Type de fichier non autorisé'), false);
  }
};

// Configuration du stockage pour les documents généraux
const documentStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    const dest = path.join(__dirname, '../../uploads/recepDocument');
    cb(null, dest);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const originalName = file.originalname;
    const ext = path.extname(originalName);
    const baseName = path.basename(originalName, ext);
    cb(null, baseName + '-' + uniqueSuffix + ext);
  }
});

// Configuration du stockage pour les BRI
const briStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    const dest = path.join(__dirname, '../../uploads/recepBri');
    cb(null, dest);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const originalName = file.originalname;
    const ext = path.extname(originalName);
    const baseName = path.basename(originalName, ext);
    cb(null, baseName + '-' + uniqueSuffix + ext);
  }
});

// Configuration pour les documents d'affectation
const affecDocumentStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    const dest = path.join(__dirname, '../../uploads/affecDocument');
    cb(null, dest);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const originalName = file.originalname;
    const ext = path.extname(originalName);
    const baseName = path.basename(originalName, ext);
    cb(null, baseName + '-' + uniqueSuffix + ext);
  }
});

// Configuration pour les documents de retour
const retourDocumentStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    const dest = path.join(__dirname, '../../uploads/retourDocument');
    cb(null, dest);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const originalName = file.originalname;
    const ext = path.extname(originalName);
    const baseName = path.basename(originalName, ext);
    cb(null, baseName + '-' + uniqueSuffix + ext);
  }
});

// Configuration pour les documents de passation
const passationDocumentStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    const dest = path.join(__dirname, '../../uploads/passationDocument');
    cb(null, dest);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const originalName = file.originalname;
    const ext = path.extname(originalName);
    const baseName = path.basename(originalName, ext);
    cb(null, baseName + '-' + uniqueSuffix + ext);
  }
});

// Configuration de multer pour les documents
const uploadDocument = multer({
  storage: documentStorage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // Limite à 5MB
  }
});

// Configuration pour les documents de marché
const marcheDocumentStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    const dest = path.join(__dirname, '../../uploads/marcheDocument');
    cb(null, dest);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const originalName = file.originalname;
    const ext = path.extname(originalName);
    const baseName = path.basename(originalName, ext);
    cb(null, baseName + '-' + uniqueSuffix + ext);
  }
});

// Configuration de multer pour les BRI
const uploadBRI = multer({
  storage: briStorage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // Limite à 5MB
  }
});

// Configuration de multer pour les documents d'affectation
const uploadAffecDocument = multer({
  storage: affecDocumentStorage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // Limite à 5MB
  }
});

// Configuration de multer pour les documents de retour
const uploadRetourDocument = multer({
  storage: retourDocumentStorage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // Limite à 5MB
  }
});

// Configuration de multer pour les documents de passation
const uploadPassationDocument = multer({
  storage: passationDocumentStorage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // Limite à 5MB
  }
}).single('file');

// Configuration de multer pour les documents de marché
const uploadMarcheDocument = multer({
  storage: marcheDocumentStorage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // Limite à 5MB
  }
}).single('file');

// Middleware de gestion des erreurs pour multer
const handleUploadError = (error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        message: 'Le fichier est trop volumineux. Taille maximale: 5MB'
      });
    }
    return res.status(400).json({ message: error.message });
  }
  next(error);
};

module.exports = {
  uploadDocument: uploadDocument.single('file'),
  uploadBRI: uploadBRI.single('file'),
  uploadAffecDocument,
  uploadRetourDocument,
  uploadPassationDocument,
  uploadMarcheDocument,
  handleUploadError
}; 