const Facture = require('../models/Facture');
const AMarche = require('../models/AMarche');
const fs = require('fs');
const path = require('path');

// Créer une nouvelle facture
exports.createFacture = async (req, res) => {
    try {
        const { marcheBC } = req.body;
        console.log('Données reçues:', req.body);

        // Vérifier d'abord que le marcheBC existe et récupérer son ID
        const marche = await AMarche.findOne({ marcheBC });
        console.log('Marché trouvé:', marche);

        if (!marche) {
            return res.status(404).json({ message: "Marché non trouvé" });
        }

        const factureData = {
            numFacture: req.body.numFacture,
            dateFacture: req.body.dateFacture,
            montant: req.body.montant,
            bl: req.body.bl,
            marcheBC: marcheBC,
            marcheRef: marche._id,
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

        console.log('Données à sauvegarder:', factureData);

        const facture = new Facture(factureData);
        const savedFacture = await facture.save();
        
        // Populate la référence au marché pour la réponse
        const populatedFacture = await Facture.findById(savedFacture._id)
            .populate('marcheRef', 'marcheBC intituleProjet date typeMarche');
            
        res.status(201).json(populatedFacture);
    } catch (error) {
        if (req.file) {
            fs.unlink(req.file.path, (err) => {
                if (err) console.error('Erreur lors de la suppression du fichier:', err);
            });
        }
        console.error('Erreur lors de la création de la facture:', error);
        res.status(400).json({ message: error.message });
    }
};

// Récupérer toutes les factures
exports.getAllFactures = async (req, res) => {
    try {
        const factures = await Facture.find()
            .populate('marcheRef', 'marcheBC intituleProjet date typeMarche')
        res.status(200).json(factures);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Récupérer une facture par son numéro
exports.getFactureByNum = async (req, res) => {
    try {
        const facture = await Facture.findOne({ numFacture: req.params.numFacture })
            .populate('marcheRef', 'marcheBC intituleProjet date typeMarche')
        if (!facture) {
            return res.status(404).json({ message: "Facture non trouvée" });
        }
        res.status(200).json(facture);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Mettre à jour une facture par son numéro
exports.updateFactureByNum = async (req, res) => {
    try {
        const facture = await Facture.findOne({ numFacture: req.params.numFacture });
        if (!facture) {
            return res.status(404).json({ message: "Facture non trouvée" });
        }

        // Si le marcheBC est modifié, vérifier qu'il existe
        if (req.body.marcheBC && req.body.marcheBC !== facture.marcheBC) {
            const marche = await AMarche.findOne({ marcheBC: req.body.marcheBC });
            if (!marche) {
                return res.status(404).json({ message: "Nouveau marché non trouvé" });
            }
            req.body.marcheRef = marche._id;
        }

        // Si un nouveau fichier est uploadé
        if (req.file) {
            // Supprimer l'ancien fichier s'il existe
            if (facture.document.path && facture.document.path !== '') {
                fs.unlink(facture.document.path, (err) => {
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

        const updatedFacture = await Facture.findOneAndUpdate(
            { numFacture: req.params.numFacture },
            req.body,
            { new: true, runValidators: true }
        ).populate('marcheRef', 'marcheBC intituleProjet date typeMarche')

        res.status(200).json(updatedFacture);
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

// Supprimer une facture par son numéro
exports.deleteFactureByNum = async (req, res) => {
    try {
        const facture = await Facture.findOne({ numFacture: req.params.numFacture });
        if (!facture) {
            return res.status(404).json({ message: "Facture non trouvée" });
        }

        // Supprimer le fichier associé s'il existe
        if (facture.document.path && facture.document.path !== '') {
            fs.unlink(facture.document.path, (err) => {
                if (err) console.error('Erreur lors de la suppression du fichier:', err);
            });
        }

        await Facture.findOneAndDelete({ numFacture: req.params.numFacture });
        res.status(200).json({ message: "Facture supprimée avec succès" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Télécharger un fichier
exports.downloadFile = async (req, res) => {
    try {
        const facture = await Facture.findOne({ numFacture: req.params.numFacture });
        if (!facture) {
            return res.status(404).json({ message: "Facture non trouvée" });
        }

        if (!facture.document.path || facture.document.path === '') {
            return res.status(404).json({ message: "Aucun fichier associé à cette facture" });
        }

        res.download(facture.document.path, facture.document.filename);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
