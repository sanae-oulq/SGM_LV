const PVDefinitif = require('../models/pvDefinitif');
const fs = require('fs');
const path = require('path');

// Créer un nouveau PV définitif
exports.create = async (req, res) => {
    try {
        const { marcheBC, marcheRef, date, marcheBCType, observations } = req.body;
        
        if (!req.file) {
            return res.status(400).json({ message: "Le fichier PV est requis" });
        }

        const pvDefinitif = new PVDefinitif({
            marcheBC,
            marcheRef,
            date,
            marcheBCType,
            observations,
            fichier: {
                originalname: req.file.originalname,
                filename: req.file.filename,
                path: req.file.path,
                mimetype: req.file.mimetype
            }
        });

        await pvDefinitif.save();
        res.status(201).json({ 
            message: "PV définitif créé avec succès",
            pvDefinitif 
        });
    } catch (error) {
        console.error('Erreur lors de la création du PV définitif:', error);
        res.status(500).json({ 
            message: "Erreur lors de la création du PV définitif",
            error: error.message 
        });
    }
};

// Récupérer tous les PV définitifs
exports.getAll = async (req, res) => {
    try {
        const pvDefinitifs = await PVDefinitif.find()
            .populate('marcheRef', 'numero intitule')
            .sort({ createdAt: -1 });
        res.json(pvDefinitifs);
    } catch (error) {
        console.error('Erreur lors de la récupération des PV définitifs:', error);
        res.status(500).json({ 
            message: "Erreur lors de la récupération des PV définitifs",
            error: error.message 
        });
    }
};

// Récupérer un PV définitif par ID
exports.getById = async (req, res) => {
    try {
        const pvDefinitif = await PVDefinitif.findById(req.params.id)
            .populate('marcheRef', 'numero intitule');
        
        if (!pvDefinitif) {
            return res.status(404).json({ message: "PV définitif non trouvé" });
        }
        
        res.json(pvDefinitif);
    } catch (error) {
        console.error('Erreur lors de la récupération du PV définitif:', error);
        res.status(500).json({ 
            message: "Erreur lors de la récupération du PV définitif",
            error: error.message 
        });
    }
};

// Mettre à jour un PV définitif
exports.update = async (req, res) => {
    try {
        const { marcheBC, marcheRef, date, marcheBCType, observations } = req.body;
        
        const updateData = {
            marcheBC,
            marcheRef,
            date,
            marcheBCType,
            observations
        };

        // Si un nouveau fichier est fourni
        if (req.file) {
            const pvDefinitif = await PVDefinitif.findById(req.params.id);
            if (pvDefinitif && pvDefinitif.fichier) {
                // Supprimer l'ancien fichier
                fs.unlink(pvDefinitif.fichier.path, (err) => {
                    if (err) console.error('Erreur lors de la suppression du fichier:', err);
                });
            }

            updateData.fichier = {
                originalname: req.file.originalname,
                filename: req.file.filename,
                path: req.file.path,
                mimetype: req.file.mimetype
            };
        }

        const pvDefinitif = await PVDefinitif.findByIdAndUpdate(
            req.params.id,
            updateData,
            { new: true }
        );

        if (!pvDefinitif) {
            return res.status(404).json({ message: "PV définitif non trouvé" });
        }

        res.json({ 
            message: "PV définitif mis à jour avec succès",
            pvDefinitif 
        });
    } catch (error) {
        console.error('Erreur lors de la mise à jour du PV définitif:', error);
        res.status(500).json({ 
            message: "Erreur lors de la mise à jour du PV définitif",
            error: error.message 
        });
    }
};

// Supprimer un PV définitif
exports.delete = async (req, res) => {
    try {
        const pvDefinitif = await PVDefinitif.findById(req.params.id);
        
        if (!pvDefinitif) {
            return res.status(404).json({ message: "PV définitif non trouvé" });
        }

        // Supprimer le fichier physique
        if (pvDefinitif.fichier && pvDefinitif.fichier.path) {
            fs.unlink(pvDefinitif.fichier.path, (err) => {
                if (err) console.error('Erreur lors de la suppression du fichier:', err);
            });
        }

        await pvDefinitif.deleteOne();
        
        res.json({ message: "PV définitif supprimé avec succès" });
    } catch (error) {
        console.error('Erreur lors de la suppression du PV définitif:', error);
        res.status(500).json({ 
            message: "Erreur lors de la suppression du PV définitif",
            error: error.message 
        });
    }
};

// Télécharger un PV définitif
exports.download = async (req, res) => {
    try {
        const pvDefinitif = await PVDefinitif.findById(req.params.id);
        
        if (!pvDefinitif || !pvDefinitif.fichier) {
            return res.status(404).json({ message: "Fichier non trouvé" });
        }

        const filePath = pvDefinitif.fichier.path;
        
        if (!fs.existsSync(filePath)) {
            return res.status(404).json({ message: "Fichier physique non trouvé" });
        }

        res.download(filePath, pvDefinitif.fichier.originalname);
    } catch (error) {
        console.error('Erreur lors du téléchargement du fichier:', error);
        res.status(500).json({ 
            message: "Erreur lors du téléchargement du fichier",
            error: error.message 
        });
    }
}; 