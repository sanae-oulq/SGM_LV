const Pvrpt = require('../models/Pvrpt');
const AMarche = require('../models/AMarche');
const fs = require('fs');
const path = require('path');

// Créer un nouveau PVRPT
exports.createPvrpt = async (req, res) => {
    try {
        const { marcheBC } = req.body;
        console.log('Données reçues:', req.body);

        // Vérifier d'abord que le marcheBC existe et récupérer son ID
        const marche = await AMarche.findOne({ marcheBC });
        console.log('Marché trouvé:', marche);

        if (!marche) {
            return res.status(404).json({ message: "Marché non trouvé" });
        }

        const pvrptData = {
            datePVRPT: req.body.datePVRPT,
            BL: req.body.BL,
            avecReserve: req.body.avecReserve,
            marcheBC: marcheBC, // Stocker la valeur du marcheBC
            marcheRef: marche._id, // Stocker la référence vers le marché
            document: req.file ? {
                filename: req.file.originalname,
                path: req.file.path,
                originalname: req.file.originalname,
                mimetype: req.file.mimetype,
                size: req.file.size
            } : {
                filename: 'Aucun',
                path: '',
                originalname: 'Aucun',
                mimetype: '',
                size: 0
            }
        };

        console.log('Données à sauvegarder:', pvrptData);

        const pvrpt = new Pvrpt(pvrptData);
        const savedPvrpt = await pvrpt.save();
        
        // Populate la référence au marché pour la réponse
        const populatedPvrpt = await Pvrpt.findById(savedPvrpt._id)
            .populate('marcheRef', 'marcheBC intituleProjet date typeMarche');
            
        res.status(201).json(populatedPvrpt);
    } catch (error) {
        if (req.file) {
            fs.unlink(req.file.path, (err) => {
                if (err) console.error('Erreur lors de la suppression du fichier:', err);
            });
        }
        console.error('Erreur lors de la création du PVRPT:', error);
        res.status(400).json({ message: error.message });
    }
};

// Récupérer tous les PVRPT
exports.getAllPvrpts = async (req, res) => {
    try {
        const pvrpts = await Pvrpt.find()
            .populate('marcheRef', 'marcheBC intituleProjet date typeMarche')
        res.status(200).json(pvrpts);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Récupérer un PVRPT par son BL
exports.getPvrptByBL = async (req, res) => {
    try {
        const pvrpt = await Pvrpt.findOne({ BL: req.params.BL })
            .populate('marcheRef', 'marcheBC intituleProjet date typeMarche')
        if (!pvrpt) {
            return res.status(404).json({ message: "PVRPT non trouvé" });
        }
        res.status(200).json(pvrpt);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Mettre à jour un PVRPT par son BL
exports.updatePvrptByBL = async (req, res) => {
    try {
        const pvrpt = await Pvrpt.findOne({ BL: req.params.BL });
        if (!pvrpt) {
            return res.status(404).json({ message: "PVRPT non trouvé" });
        }

        // Si le marcheBC est modifié, vérifier qu'il existe
        if (req.body.marcheBC && req.body.marcheBC !== pvrpt.marcheBC) {
            const marche = await AMarche.findOne({ marcheBC: req.body.marcheBC });
            if (!marche) {
                return res.status(404).json({ message: "Nouveau marché non trouvé" });
            }
            req.body.marcheRef = marche._id;
        }

        // Si un nouveau fichier est uploadé
        if (req.file) {
            // Supprimer l'ancien fichier s'il existe
            if (pvrpt.document.path && pvrpt.document.path !== '') {
                fs.unlink(pvrpt.document.path, (err) => {
                    if (err) console.error('Erreur lors de la suppression de l\'ancien fichier:', err);
                });
            }

            // Mettre à jour avec le nouveau fichier
            req.body.document = {
                filename: req.file.originalname,
                path: req.file.path,
                originalname: req.file.originalname,
                mimetype: req.file.mimetype,
                size: req.file.size
            };
        }

        const updatedPvrpt = await Pvrpt.findOneAndUpdate(
            { BL: req.params.BL },
            req.body,
            { new: true, runValidators: true }
        ).populate('marcheRef', 'marcheBC intituleProjet date typeMarche')

        res.status(200).json(updatedPvrpt);
    } catch (error) {
        // Si une erreur survient, supprimer le nouveau fichier si il a été uploadé
        if (req.file) {
            fs.unlink(req.file.path, (err) => {
                if (err) console.error('Erreur lors de la suppression du fichier:', err);
            });
        }
        res.status(400).json({ message: error.message });
    }
};

// Supprimer un PVRPT par son BL
exports.deletePvrptByBL = async (req, res) => {
    try {
        const pvrpt = await Pvrpt.findOne({ BL: req.params.BL });
        if (!pvrpt) {
            return res.status(404).json({ message: "PVRPT non trouvé" });
        }

        // Supprimer le fichier associé s'il existe
        if (pvrpt.document.path && pvrpt.document.path !== '') {
            fs.unlink(pvrpt.document.path, (err) => {
                if (err) console.error('Erreur lors de la suppression du fichier:', err);
            });
        }

        await Pvrpt.findOneAndDelete({ BL: req.params.BL });
        res.status(200).json({ message: "PVRPT supprimé avec succès" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Télécharger un fichier
exports.downloadFile = async (req, res) => {
    try {
        const pvrpt = await Pvrpt.findOne({ BL: req.params.BL });
        if (!pvrpt) {
            return res.status(404).json({ message: "PVRPT non trouvé" });
        }

        if (!pvrpt.document.path || pvrpt.document.path === '') {
            return res.status(404).json({ message: "Aucun fichier associé à ce PVRPT" });
        }

        res.download(pvrpt.document.path, pvrpt.document.filename);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
