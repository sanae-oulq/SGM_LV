const Bris = require('../models/Bris');
const fs = require('fs');
const path = require('path');

// Vérifier l'existence d'un BRI
exports.checkExists = async (req, res) => {
    try {
        const { marcheBC, filename } = req.query;
        const existingBri = await Bris.findOne({ 
            marcheBC: marcheBC,
            originalname: filename
        });
        
        res.json({ 
            exists: !!existingBri,
            message: existingBri 
                ? `Ce BRI existe déjà pour le marché ${marcheBC}` 
                : `BRI non trouvé pour le marché ${marcheBC} avec le fichier "${filename}"`
        });
    } catch (error) {
        console.error('Erreur lors de la vérification du BRI:', error);
        res.status(500).json({ message: "Erreur lors de la vérification du BRI" });
    }
};

// Créer un nouveau BRI
exports.create = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: "Aucun fichier n'a été uploadé" });
        }

        const { marcheBC, marcheRef } = req.body;
        if (!marcheBC) {
            return res.status(400).json({ message: "Le numéro de marché/BC est requis" });
        }

        if (!marcheRef) {
            return res.status(400).json({ message: "La référence du marché est requise" });
        }

        const bris = new Bris({
            marcheBC,
            marcheRef,
            filename: req.file.filename,
            originalname: req.file.originalname,
            path: req.file.path,
            mimetype: req.file.mimetype,
            size: req.file.size
        });

        await bris.save();
        res.status(201).json(bris);
    } catch (error) {
        console.error('Erreur lors de la création du BRI:', error);
        res.status(500).json({ 
            message: "Erreur lors de la création du BRI",
            error: error.message 
        });
    }
};

// Récupérer tous les BRIs
exports.getAll = async (req, res) => {
    try {
        const bris = await Bris.find().populate('marcheRef');
        res.json(bris);
    } catch (error) {
        console.error('Erreur lors de la récupération des BRIs:', error);
        res.status(500).json({ message: "Erreur lors de la récupération des BRIs" });
    }
};

// Récupérer les BRIs par marché
exports.getByMarche = async (req, res) => {
    try {
        const bris = await Bris.find({ marcheBC: req.params.marcheBC }).populate('marcheRef');
        res.json(bris);
    } catch (error) {
        console.error('Erreur lors de la récupération des BRIs:', error);
        res.status(500).json({ message: "Erreur lors de la récupération des BRIs" });
    }
};

// Supprimer un BRI
exports.delete = async (req, res) => {
    try {
        const { marcheBC, fileName } = req.body;
        
        if (!marcheBC || !fileName) {
            return res.status(400).json({ message: "Le numéro de marché et le nom du fichier sont requis" });
        }

        const bris = await Bris.findOne({ 
            marcheBC: marcheBC,
            originalname: fileName
        });

        if (!bris) {
            return res.status(404).json({ message: `BRI non trouvé pour le marché ${marcheBC} avec le fichier "${fileName}"` });
        }

        // Supprimer le fichier physique
        fs.unlink(bris.path, async (err) => {
            if (err) {
                console.error('Erreur lors de la suppression du fichier:', err);
            }
            // Supprimer l'enregistrement de la base de données
            await Bris.findByIdAndDelete(bris._id);
            res.json({ message: "BRI supprimé avec succès" });
        });
    } catch (error) {
        console.error('Erreur lors de la suppression du BRI:', error);
        res.status(500).json({ message: "Erreur lors de la suppression du BRI" });
    }
};

// Télécharger un BRI
exports.download = async (req, res) => {
    try {
        const bris = await Bris.findById(req.params.id);
        if (!bris) {
            return res.status(404).json({ message: "BRI non trouvé" });
        }

        res.download(bris.path, bris.originalname);
    } catch (error) {
        console.error('Erreur lors du téléchargement du BRI:', error);
        res.status(500).json({ message: "Erreur lors du téléchargement du BRI" });
    }
}; 