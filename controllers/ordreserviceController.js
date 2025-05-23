const OrderService = require('../models/OrderService');

// Créer un nouvel ordre de service
exports.createOrderService = async (req, res) => {
    try {
        const orderService = new OrderService(req.body);
        const savedOrderService = await orderService.save();
        res.status(201).json(savedOrderService);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Récupérer tous les ordres de service
exports.getAllOrderServices = async (req, res) => {
    try {
        const orderServices = await OrderService.find();
        res.status(200).json(orderServices);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Récupérer un ordre de service par son ID
exports.getOrderServiceById = async (req, res) => {
    try {
        const orderService = await OrderService.findById(req.params.id);
        if (!orderService) {
            return res.status(404).json({ message: "Ordre de service non trouvé" });
        }
        res.status(200).json(orderService);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Mettre à jour un ordre de service
exports.updateOrderService = async (req, res) => {
    try {
        const orderService = await OrderService.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );
        if (!orderService) {
            return res.status(404).json({ message: "Ordre de service non trouvé" });
        }
        res.status(200).json(orderService);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Supprimer un ordre de service
exports.deleteOrderService = async (req, res) => {
    try {
        const orderService = await OrderService.findByIdAndDelete(req.params.id);
        if (!orderService) {
            return res.status(404).json({ message: "Ordre de service non trouvé" });
        }
        res.status(200).json({ message: "Ordre de service supprimé avec succès" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}; 