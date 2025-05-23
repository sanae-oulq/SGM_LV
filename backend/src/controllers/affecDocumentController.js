const AffecDocument = require('../models/AffecDocument');
const path = require('path');
const fs = require('fs');

// Upload un document
exports.uploadDocument = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'Aucun fichier n\'a été uploadé' });
    }

    const document = new AffecDocument({
      fileName: req.body.fileName,
      typeFile: req.body.typeFile,
      description: req.body.description,
      affectationId: req.body.affectationId,
      filePath: req.file.path
    });

    await document.save();
    res.status(201).json({ message: 'Document uploadé avec succès', document });
  } catch (error) {
    console.error('Erreur lors de l\'upload du document:', error);
    res.status(500).json({ message: 'Erreur lors de l\'upload du document' });
  }
};

// Récupérer tous les documents d'une affectation
exports.getDocumentsByAffectation = async (req, res) => {
  try {
    const documents = await AffecDocument.find({ affectationId: req.params.affectationId });
    res.json(documents);
  } catch (error) {
    console.error('Erreur lors de la récupération des documents:', error);
    res.status(500).json({ message: 'Erreur lors de la récupération des documents' });
  }
};

// Télécharger un document
exports.downloadDocument = async (req, res) => {
  try {
    const document = await AffecDocument.findById(req.params.id);
    if (!document) {
      return res.status(404).json({ message: 'Document non trouvé' });
    }

    const filePath = document.filePath;
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ message: 'Fichier non trouvé sur le serveur' });
    }

    res.download(filePath, document.fileName);
  } catch (error) {
    console.error('Erreur lors du téléchargement du document:', error);
    res.status(500).json({ message: 'Erreur lors du téléchargement du document' });
  }
};

// Supprimer un document
exports.deleteDocument = async (req, res) => {
  try {
    const document = await AffecDocument.findById(req.params.id);
    if (!document) {
      return res.status(404).json({ message: 'Document non trouvé' });
    }

    // Supprimer le fichier physique
    if (fs.existsSync(document.filePath)) {
      fs.unlinkSync(document.filePath);
    }

    // Supprimer l'entrée de la base de données
    await AffecDocument.deleteOne({ _id: req.params.id });
    res.json({ message: 'Document supprimé avec succès' });
  } catch (error) {
    console.error('Erreur lors de la suppression du document:', error);
    res.status(500).json({ message: 'Erreur lors de la suppression du document' });
  }
}; 