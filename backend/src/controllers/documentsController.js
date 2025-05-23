const RecepDocuments = require('../models/RecepDocuments');
const RecepBRI = require('../models/RecepBRI');
const fs = require('fs');
const path = require('path');

// Fonction pour uploader un document
exports.uploadDocument = async (req, res) => {
  try {
    const { typeFile, description, receptionId } = req.body;
    const file = req.file;

    if (!file) {
      throw new Error('Aucun fichier n\'a été uploadé');
    }

    // Lire le contenu du fichier
    const fileData = fs.readFileSync(file.path);

    const newDocument = new RecepDocuments({
      fileName: file.originalname,
      fileData,
      typeFile,
      description,
      receptionId
    });

    await newDocument.save();

    res.status(201).json({ message: 'Document uploadé avec succès', document: newDocument });
  } catch (error) {
    console.error('Erreur lors de l\'upload du document:', error);
    res.status(500).json({ message: 'Erreur lors de l\'upload du document', error: error.message });
  }
};

// Fonction pour uploader un BRI
exports.uploadBRI = async (req, res) => {
  try {
    const { typeFile, description, receptionId } = req.body;
    const file = req.file;

    if (!file) {
      throw new Error('Aucun fichier n\'a été uploadé');
    }

    // Lire le contenu du fichier
    const fileData = fs.readFileSync(file.path);

    const newBRI = new RecepBRI({
      fileName: file.originalname,
      fileData,
      typeFile,
      description,
      receptionId
    });

    await newBRI.save();

    res.status(201).json({ message: 'BRI uploadé avec succès', bri: newBRI });
  } catch (error) {
    console.error('Erreur lors de l\'upload du BRI:', error);
    res.status(500).json({ message: 'Erreur lors de l\'upload du BRI', error: error.message });
  }
};

// Fonction pour récupérer les documents d'une réception
exports.getDocumentsByReceptionId = async (req, res) => {
  try {
    const { receptionId } = req.params;
    const documents = await RecepDocuments.find({ receptionId });
    res.status(200).json(documents);
  } catch (error) {
    console.error('Erreur lors de la récupération des documents:', error);
    res.status(500).json({ message: 'Erreur lors de la récupération des documents', error: error.message });
  }
};

// Fonction pour récupérer les BRI d'une réception
exports.getBRIByReceptionId = async (req, res) => {
  try {
    const { receptionId } = req.params;
    const bris = await RecepBRI.find({ receptionId });
    res.status(200).json(bris);
  } catch (error) {
    console.error('Erreur lors de la récupération des BRI:', error);
    res.status(500).json({ message: 'Erreur lors de la récupération des BRI', error: error.message });
  }
};

// Fonction pour supprimer un document
exports.deleteDocument = async (req, res) => {
  try {
    const { id } = req.params;
    const document = await RecepDocuments.findById(id);
    if (!document) {
      throw new Error('Document non trouvé');
    }

    // Supprimer le fichier physique
    const filePath = path.join(__dirname, '../../uploads/recepDocument', document.fileName);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    await RecepDocuments.findByIdAndDelete(id);
    res.status(200).json({ message: 'Document supprimé avec succès' });
  } catch (error) {
    console.error('Erreur lors de la suppression du document:', error);
    res.status(500).json({ message: 'Erreur lors de la suppression du document', error: error.message });
  }
};

// Fonction pour supprimer un BRI
exports.deleteBRI = async (req, res) => {
  try {
    const { id } = req.params;
    const bri = await RecepBRI.findById(id);
    if (!bri) {
      throw new Error('BRI non trouvé');
    }

    // Supprimer le fichier physique
    const filePath = path.join(__dirname, '../../uploads/recepBri', bri.fileName);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    await RecepBRI.findByIdAndDelete(id);
    res.status(200).json({ message: 'BRI supprimé avec succès' });
  } catch (error) {
    console.error('Erreur lors de la suppression du BRI:', error);
    res.status(500).json({ message: 'Erreur lors de la suppression du BRI', error: error.message });
  }
};

// Fonction pour télécharger un document
exports.downloadDocument = async (req, res) => {
  try {
    const { id } = req.params;
    const document = await RecepDocuments.findById(id);
    
    if (!document) {
      return res.status(404).json({ message: 'Document non trouvé' });
    }

    // Définir les headers pour le téléchargement
    res.setHeader('Content-Type', document.typeFile);
    res.setHeader('Content-Disposition', `attachment; filename="${document.fileName}"`);

    // Envoyer les données du fichier
    res.send(document.fileData);
  } catch (error) {
    console.error('Erreur lors du téléchargement du document:', error);
    res.status(500).json({ 
      message: 'Erreur lors du téléchargement du document', 
      error: error.message 
    });
  }
};

// Fonction pour télécharger un BRI
exports.downloadBRI = async (req, res) => {
  try {
    const { id } = req.params;
    console.log('Tentative de téléchargement du BRI avec ID:', id);
    
    const bri = await RecepBRI.findById(id);
    console.log('BRI trouvé:', bri ? 'Oui' : 'Non');
    
    if (!bri) {
      console.log('BRI non trouvé dans la base de données');
      return res.status(404).json({ message: 'BRI non trouvé' });
    }

    console.log('Informations du BRI:', {
      fileName: bri.fileName,
      typeFile: bri.typeFile,
      hasFileData: !!bri.fileData
    });

    // Définir les headers pour le téléchargement
    res.setHeader('Content-Type', bri.typeFile);
    res.setHeader('Content-Disposition', `attachment; filename="${bri.fileName}"`);

    // Envoyer les données du fichier
    res.send(bri.fileData);
    console.log('BRI envoyé avec succès');
  } catch (error) {
    console.error('Erreur détaillée lors du téléchargement du BRI:', error);
    res.status(500).json({ 
      message: 'Erreur lors du téléchargement du BRI', 
      error: error.message 
    });
  }
}; 