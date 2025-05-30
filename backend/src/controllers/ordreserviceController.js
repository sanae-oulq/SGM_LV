const OrderService = require('../models/OrderService');
const fs = require('fs');
const path = require('path');
const AMarche = require('../models/AMarche');

// Créer un nouvel ordre de service
exports.createOrderService = async (req, res) => {
    try {

        const { marcheBC } = req.body;
if (!marcheBC) {
    return res.status(400).json({ message: "Le marché est obligatoire" });
}

 // Ajoutez ces lignes
        const marche = await AMarche.findOne({ marcheBC: marcheBC });
        if (!marche) {
            return res.status(400).json({ message: "Marché non trouvé" });
        }


        const orderServiceData = {
            ...req.body,
            marcheBC,
            marcheRef: marche._id,  // Ajoutez cette ligne
            fichier: req.file ? {
                filename: req.file.originalname,
                path: req.file.path
            } : {
                filename: 'Aucun',
                path: ''
            }
        };

        const orderService = new OrderService(orderServiceData);
        const savedOrderService = await orderService.save();
        res.status(201).json(savedOrderService);
    } catch (error) {
        // Si une erreur survient, supprimer le fichier si il a été uploadé
        if (req.file) {
            fs.unlink(req.file.path, (err) => {
                if (err) console.error('Erreur lors de la suppression du fichier:', err);
            });
        }
        res.status(400).json({ message: error.message });
    }
};

// Récupérer tous les ordres de service
exports.getAllOrderServices = async (req, res) => {
    try {
        const orderServices = await OrderService.find()
        .populate('marcheRef', 'numeroMarche intituleProjet');
        res.status(200).json(orderServices);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Récupérer un ordre de service par son numeroOS
exports.getOrderServiceByNumero = async (req, res) => {
    try {
        const orderService = await OrderService.findOne({ numeroOS: req.params.numeroOS });
        if (!orderService) {
            return res.status(404).json({ message: "Ordre de service non trouvé" });
        }
        res.status(200).json(orderService);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Mettre à jour un ordre de service par son numeroOS
exports.updateOrderServiceByNumero = async (req, res) => {
    try {

        const { marcheBC } = req.body;
if (!marcheBC) {
    return res.status(400).json({ message: "Le marché est obligatoire" });
}

// Ajoutez ces lignes
        const marche = await AMarche.findOne({ marcheBC: marcheBC });
        if (!marche) {
            return res.status(400).json({ message: "Marché non trouvé" });
        }

        const orderService = await OrderService.findOne({ numeroOS: req.params.numeroOS });
        if (!orderService) {
            return res.status(404).json({ message: "Ordre de service non trouvé" });
        }

        // Si un nouveau fichier est uploadé
        if (req.file) {
            // Supprimer l'ancien fichier s'il existe
            if (orderService.fichier.path && orderService.fichier.path !== '') {
                fs.unlink(orderService.fichier.path, (err) => {
                    if (err) console.error('Erreur lors de la suppression de l\'ancien fichier:', err);
                });
            }

            // Mettre à jour avec le nouveau fichier
            req.body.fichier = {
                filename: req.file.originalname,
                path: req.file.path
            };
        }

        const updatedOrderService = await OrderService.findOneAndUpdate(
            { numeroOS: req.params.numeroOS },
            { ...req.body, marcheBC,marcheRef: marche._id },
            { new: true, runValidators: true }
        );

        res.status(200).json(updatedOrderService);
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

// Supprimer un ordre de service par son numeroOS
exports.deleteOrderServiceByNumero = async (req, res) => {
    try {
        const orderService = await OrderService.findOne({ numeroOS: req.params.numeroOS });
        if (!orderService) {
            return res.status(404).json({ message: "Ordre de service non trouvé" });
        }

        // Supprimer le fichier associé s'il existe
        if (orderService.fichier.path && orderService.fichier.path !== '') {
            fs.unlink(orderService.fichier.path, (err) => {
                if (err) console.error('Erreur lors de la suppression du fichier:', err);
            });
        }

        await OrderService.findOneAndDelete({ numeroOS: req.params.numeroOS });
        res.status(200).json({ message: "Ordre de service supprimé avec succès" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Télécharger un fichier
exports.downloadFile = async (req, res) => {
    try {
        const orderService = await OrderService.findOne({ numeroOS: req.params.numeroOS });
        if (!orderService) {
            return res.status(404).json({ message: "Ordre de service non trouvé" });
        }

        if (!orderService.fichier.path || orderService.fichier.path === '') {
            return res.status(404).json({ message: "Aucun fichier associé à cet ordre de service" });
        }

        res.download(orderService.fichier.path, orderService.fichier.filename);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
