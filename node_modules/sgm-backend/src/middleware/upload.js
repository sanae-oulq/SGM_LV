const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Configuration du stockage
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        let uploadPath = 'uploads/';
        
        // Déterminer le sous-dossier en fonction de l'URL
        if (req.originalUrl.includes('/api/pv/provisoire')) {
            uploadPath += 'pv/provisoire/';
        } else if (req.originalUrl.includes('/api/pv/definitif')) {
            uploadPath += 'pv/definitif/';
        } else if (req.originalUrl.includes('/api/bris')) {
            uploadPath += 'bris/';
        } else if (req.originalUrl.includes('/api/ordreservice')) {
            uploadPath += 'ordreservice/';
        }

        // Créer le dossier s'il n'existe pas
        fs.mkdirSync(uploadPath, { recursive: true });
        cb(null, uploadPath);
    },
    filename: function (req, file, cb) {
        // Générer un nom de fichier unique
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});

// Filtre pour les types de fichiers acceptés
const fileFilter = (req, file, cb) => {
    const allowedTypes = [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'image/jpeg',
        'image/png'
    ];

    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Type de fichier non autorisé. Seuls les fichiers PDF, Word, Excel et images sont acceptés.'));
    }
};

// Configuration de Multer
const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 10 * 1024 * 1024 // Limite de 10MB
    }
});

// Middleware de gestion des erreurs Multer
const handleMulterError = (err, req, res, next) => {
    if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({
                message: "Le fichier est trop volumineux. La taille maximale est de 10MB."
            });
        }
        return res.status(400).json({
            message: "Erreur lors du téléchargement du fichier.",
            error: err.message
        });
    } else if (err) {
        return res.status(400).json({
            message: err.message
        });
    }
    next();
};

module.exports = {
    upload,
    handleMulterError
}; 