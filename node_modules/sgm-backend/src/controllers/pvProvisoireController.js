const PVProvisoire = require('../models/pvProvisoire');
const fs = require('fs');
const path = require('path');

// Créer un nouveau PV provisoire
exports.create = async (req, res) => {
    try {
        const { marcheBC, marcheRef, date, marcheBCType, avecReserve, observations } = req.body;
        
        if (!req.file) {
            return res.status(400).json({ message: "Le fichier PV est requis" });
        }

        const pvProvisoire = new PVProvisoire({
            marcheBC,
            marcheRef,
            date,
            marcheBCType,
            avecReserve,
            observations,
            fichier: {
                originalname: req.file.originalname,
                filename: req.file.filename,
                path: req.file.path,
                mimetype: req.file.mimetype
            }
        });

        await pvProvisoire.save();
        res.status(201).json({ 
            message: "PV provisoire créé avec succès",
            pvProvisoire 
        });
    } catch (error) {
        console.error('Erreur lors de la création du PV provisoire:', error);
        res.status(500).json({ 
            message: "Erreur lors de la création du PV provisoire",
            error: error.message 
        });
    }
};

// Récupérer tous les PV provisoires
exports.getAll = async (req, res) => {
    try {
        const pvProvisoires = await PVProvisoire.find()
            .populate('marcheRef', 'numero intitule')
            .sort({ createdAt: -1 });
        res.json(pvProvisoires);
    } catch (error) {
        console.error('Erreur lors de la récupération des PV provisoires:', error);
        res.status(500).json({ 
            message: "Erreur lors de la récupération des PV provisoires",
            error: error.message 
        });
    }
};

// Récupérer un PV provisoire par ID
exports.getById = async (req, res) => {
    try {
        const pvProvisoire = await PVProvisoire.findById(req.params.id)
            .populate('marcheRef', 'numero intitule');
        
        if (!pvProvisoire) {
            return res.status(404).json({ message: "PV provisoire non trouvé" });
        }
        
        res.json(pvProvisoire);
    } catch (error) {
        console.error('Erreur lors de la récupération du PV provisoire:', error);
        res.status(500).json({ 
            message: "Erreur lors de la récupération du PV provisoire",
            error: error.message 
        });
    }
};

// Mettre à jour un PV provisoire
exports.update = async (req, res) => {
    try {
        const { marcheBC, marcheRef, date, marcheBCType, avecReserve, observations } = req.body;
        
        const updateData = {
            marcheBC,
            marcheRef,
            date,
            marcheBCType,
            avecReserve,
            observations
        };

        // Si un nouveau fichier est fourni
        if (req.file) {
            const pvProvisoire = await PVProvisoire.findById(req.params.id);
            if (pvProvisoire && pvProvisoire.fichier) {
                // Supprimer l'ancien fichier
                fs.unlink(pvProvisoire.fichier.path, (err) => {
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

        const pvProvisoire = await PVProvisoire.findByIdAndUpdate(
            req.params.id,
            updateData,
            { new: true }
        );

        if (!pvProvisoire) {
            return res.status(404).json({ message: "PV provisoire non trouvé" });
        }

        res.json({ 
            message: "PV provisoire mis à jour avec succès",
            pvProvisoire 
        });
    } catch (error) {
        console.error('Erreur lors de la mise à jour du PV provisoire:', error);
        res.status(500).json({ 
            message: "Erreur lors de la mise à jour du PV provisoire",
            error: error.message 
        });
    }
};

// Supprimer un PV provisoire
exports.delete = async (req, res) => {
    try {
        const pvProvisoire = await PVProvisoire.findById(req.params.id);
        
        if (!pvProvisoire) {
            return res.status(404).json({ message: "PV provisoire non trouvé" });
        }

        // Supprimer le fichier physique
        if (pvProvisoire.fichier && pvProvisoire.fichier.path) {
            fs.unlink(pvProvisoire.fichier.path, (err) => {
                if (err) console.error('Erreur lors de la suppression du fichier:', err);
            });
        }

        await pvProvisoire.deleteOne();
        
        res.json({ message: "PV provisoire supprimé avec succès" });
    } catch (error) {
        console.error('Erreur lors de la suppression du PV provisoire:', error);
        res.status(500).json({ 
            message: "Erreur lors de la suppression du PV provisoire",
            error: error.message 
        });
    }
};

// Télécharger un PV provisoire
exports.download = async (req, res) => {
    try {
        const pvProvisoire = await PVProvisoire.findById(req.params.id);
        
        if (!pvProvisoire || !pvProvisoire.fichier) {
            return res.status(404).json({ message: "Fichier non trouvé" });
        }

        const filePath = pvProvisoire.fichier.path;
        
        if (!fs.existsSync(filePath)) {
            return res.status(404).json({ message: "Fichier physique non trouvé" });
        }

        res.download(filePath, pvProvisoire.fichier.originalname);
    } catch (error) {
        console.error('Erreur lors du téléchargement du fichier:', error);
        res.status(500).json({ 
            message: "Erreur lors du téléchargement du fichier",
            error: error.message 
        });
    }
}; 