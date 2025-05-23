const PassationDocument = require('../models/passationDocument');
const path = require('path');
const fs = require('fs');

// Upload un document
exports.uploadDocument = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'Aucun fichier fourni' });
    }

    const document = new PassationDocument({
      passationId: req.body.passationId,
      fileName: req.body.fileName,
      typeFile: req.body.typeFile,
      description: req.body.description || '',
      filePath: req.file.path
    });

    await document.save();
    res.status(201).json({ 
      success: true, 
      document: {
        _id: document._id,
        fileName: document.fileName,
        typeFile: document.typeFile,
        date: document.date,
        description: document.description
      } 
    });
  } catch (error) {
    console.error('Erreur lors de l\'upload du document:', error);
    res.status(500).json({ message: error.message });
  }
};

// Récupérer tous les documents d'une passation
exports.getDocumentsByPassationId = async (req, res) => {
  try {
    const documents = await PassationDocument.find({ 
      passationId: req.params.passationId 
    }).select('-filePath');
    
    res.status(200).json(documents);
  } catch (error) {
    console.error('Erreur lors de la récupération des documents:', error);
    res.status(500).json({ message: error.message });
  }
};

// Télécharger un document
exports.downloadDocument = async (req, res) => {
  try {
    const document = await PassationDocument.findById(req.params.id);
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
    res.status(500).json({ message: error.message });
  }
};

// Supprimer un document
exports.deleteDocument = async (req, res) => {
  try {
    const document = await PassationDocument.findById(req.params.id);
    if (!document) {
      return res.status(404).json({ message: 'Document non trouvé' });
    }

    // Supprimer le fichier physique
    if (fs.existsSync(document.filePath)) {
      fs.unlinkSync(document.filePath);
    }

    await PassationDocument.deleteOne({ _id: document._id });
    res.status(200).json({ message: 'Document supprimé avec succès' });
  } catch (error) {
    console.error('Erreur lors de la suppression du document:', error);
    res.status(500).json({ message: error.message });
  }
}; 