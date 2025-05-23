const SerialNumber = require('../models/snModel');

// Vérifier si un SN existe (renvoie juste un booléen)
exports.checkSN = async (req, res) => {
  try {
    const sn = await SerialNumber.findOne({ sn: req.params.sn });
    return res.status(200).json({ exists: !!sn });
  } catch (error) {
    console.error('Erreur lors de la vérification du SN:', error);
    res.status(500).json({ message: 'Erreur lors de la vérification du numéro de série' });
  }
};

// Récupérer un SN spécifique
exports.getSN = async (req, res) => {
  try {
    const sn = await SerialNumber.findOne({ sn: req.params.sn });
    if (sn) {
      return res.status(200).json(sn);
    }
    return res.status(404).json({ message: 'Numéro de série non trouvé' });
  } catch (error) {
    console.error('Erreur lors de la récupération du SN:', error);
    res.status(500).json({ message: 'Erreur lors de la récupération du numéro de série' });
  }
};

// Créer un nouveau SN
exports.createSN = async (req, res) => {
  try {
    const { sn, codeBarre, codeProduit, marche, idMarche, numeroPrix, dateReception, finGarantie, receptionId } = req.body;
    
    // Validation des champs requis
    if (!sn || !codeProduit || !marche || !numeroPrix || !receptionId) {
      return res.status(400).json({ 
        message: 'Les champs suivants sont requis : sn, codeProduit, marche, numeroPrix, receptionId' 
      });
    }

    // Validation du format SN
    const validSnPattern = /^[a-zA-Z0-9-_]+$/;
    if (!validSnPattern.test(sn)) {
      return res.status(400).json({ 
        message: 'Le numéro de série ne peut contenir que des lettres, des chiffres, des tirets et des underscores' 
      });
    }

    // Vérifier si le SN existe déjà
    const existingSN = await SerialNumber.findOne({ sn });
    if (existingSN) {
      return res.status(400).json({ message: 'Ce numéro de série existe déjà' });
    }

    // Créer le nouveau SN
    const newSN = new SerialNumber({
      sn,
      codeBarre,
      codeProduit,
      marche,
      idMarche,
      numeroPrix,
      dateReception,
      finGarantie,
      receptionId
    });

    const savedSN = await newSN.save();
    res.status(201).json(savedSN);
  } catch (error) {
    console.error('Erreur lors de la création du SN:', error);
    if (error.name === 'ValidationError') {
      return res.status(400).json({ message: 'Données invalides', details: error.message });
    }
    res.status(500).json({ message: 'Erreur lors de la création du numéro de série' });
  }
};

// Récupérer tous les SN
exports.getAllSN = async (req, res) => {
  try {
    const sns = await SerialNumber.find().populate('idMarche', 'marcheBC');
    res.status(200).json(sns);
  } catch (error) {
    console.error('Erreur lors de la récupération des SN:', error);
    res.status(500).json({ message: 'Erreur lors de la récupération des numéros de série' });
  }
};

// Récupérer les SN par marché
exports.getSNByMarche = async (req, res) => {
  try {
    const sns = await SerialNumber.find({ idMarche: req.params.idMarche });
    if (!sns || sns.length === 0) {
      return res.status(404).json({ message: 'Aucun numéro de série trouvé pour ce marché' });
    }
    res.status(200).json(sns);
  } catch (error) {
    console.error('Erreur lors de la récupération des SN par marché:', error);
    res.status(500).json({ message: 'Erreur lors de la récupération des numéros de série par marché' });
  }
}; 