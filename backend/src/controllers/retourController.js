const Retour = require('../models/Retour');
const AMarche = require('../models/AMarche');

// Récupérer tous les retours
exports.getAllRetours = async (req, res) => {
  try {
    const retours = await Retour.find().sort({ dateRetour: -1 });
    
    // Pour chaque retour, récupérer les détails du marché
    const retoursWithDetails = await Promise.all(retours.map(async (retour) => {
      const marche = await AMarche.findOne({ marcheBC: retour.marcheBC });
      if (marche) {
        // Trouver les détails de la réception dans le marché
        const reception = marche.detailProjet.reduce((found, projet) => {
          if (found) return found;
          return projet.detailsPrix.reduce((foundInPrix, prix) => {
            if (foundInPrix) return foundInPrix;
            const reception = (prix.receptions || []).find(r => r.sn === retour.snReception);
            if (reception) {
              return {
                codeProduit: prix.reference,
                designation: prix.designation
              };
            }
            return null;
          }, null);
        }, null);

        return {
          ...retour.toObject(),
          codeProduit: reception ? reception.codeProduit : '',
          designation: reception ? reception.designation : ''
        };
      }
      return retour;
    }));

    // Grouper les retours par retourId
    const groupedRetours = retoursWithDetails.reduce((acc, retour) => {
      if (!acc[retour.retourId]) {
        acc[retour.retourId] = [];
      }
      acc[retour.retourId].push(retour);
      return acc;
    }, {});

    res.status(200).json(retoursWithDetails);
  } catch (error) {
    console.error('Erreur lors de la récupération des retours:', error);
    res.status(500).json({
      message: "Erreur lors de la récupération des retours",
      error: error.message
    });
  }
};

// Récupérer un retour par son retourId
exports.getRetourById = async (req, res) => {
  try {
    const { retourId } = req.params;
    const retours = await Retour.find({ retourId });

    if (!retours || retours.length === 0) {
      return res.status(404).json({ message: "Retour non trouvé" });
    }

    // Récupérer les détails du marché pour chaque retour
    const retoursWithDetails = await Promise.all(retours.map(async (retour) => {
      const marche = await AMarche.findOne({ marcheBC: retour.marcheBC });
      if (marche) {
        const reception = marche.detailProjet.reduce((found, projet) => {
          if (found) return found;
          return projet.detailsPrix.reduce((foundInPrix, prix) => {
            if (foundInPrix) return foundInPrix;
            const reception = (prix.receptions || []).find(r => r.sn === retour.snReception);
            if (reception) {
              return {
                codeProduit: prix.reference,
                designation: prix.designation
              };
            }
            return null;
          }, null);
        }, null);

        return {
          ...retour.toObject(),
          codeProduit: reception ? reception.codeProduit : '',
          designation: reception ? reception.designation : ''
        };
      }
      return retour;
    }));

    res.status(200).json(retoursWithDetails);
  } catch (error) {
    console.error('Erreur lors de la récupération du retour:', error);
    res.status(500).json({
      message: "Erreur lors de la récupération du retour",
      error: error.message
    });
  }
};

// Créer plusieurs retours
exports.createMultipleRetours = async (req, res) => {
  console.log('Requête reçue dans createMultipleRetours');
  console.log('Body:', req.body);
  
  try {
    const { retours } = req.body;

    if (!Array.isArray(retours) || retours.length === 0) {
      return res.status(400).json({ message: "Le champ 'retours' doit être un tableau non vide" });
    }

    // Validation des champs requis pour chaque retour
    for (const [index, retour] of retours.entries()) {
      const requiredFields = [
        'retourId',
        'dateRetour',
        'marcheBC',
        'idMarche',
        'numPrix',
        'snReception',
        'codeBarre',
        'codeChaine',
        'nomChaine',
        'service',
        'utilisateur',
        'etat',
        'affectationId'
      ];

      const missingFields = requiredFields.filter(field => !retour[field]);
      
      if (missingFields.length > 0) {
        return res.status(400).json({
          message: `Champs requis manquants pour le retour ${index + 1}`,
          missingFields
        });
      }
    }

    // Vérifier que le marché existe pour le premier retour
    const firstRetour = retours[0];
    const marche = await AMarche.findOne({ marcheBC: firstRetour.marcheBC });
    if (!marche) {
      return res.status(404).json({ message: "Marché non trouvé" });
    }

    // Créer tous les retours
    const createdRetours = await Promise.all(
      retours.map(async (retourData) => {
        try {
          const newRetour = new Retour(retourData);
          const savedRetour = await newRetour.save();
          console.log('Retour sauvegardé:', savedRetour);
          return savedRetour;
        } catch (error) {
          console.error('Erreur lors de la création d\'un retour:', error);
          throw new Error(`Erreur lors de la création du retour: ${error.message}`);
        }
      })
    );

    res.status(201).json({
      message: "Retours créés avec succès",
      retours: createdRetours
    });

  } catch (error) {
    console.error('Erreur détaillée:', error);
    res.status(500).json({
      message: "Erreur lors de la création des retours",
      error: error.message,
      stack: error.stack
    });
  }
};

// Récupérer les retours par marché
exports.getRetoursByMarche = async (req, res) => {
  try {
    const { marcheBC } = req.query;
    
    if (!marcheBC) {
      return res.status(400).json({ message: "Le numéro de marché est requis" });
    }

    const retours = await Retour.find({ marcheBC });
    res.status(200).json(retours);

  } catch (error) {
    console.error('Erreur lors de la récupération des retours:', error);
    res.status(500).json({
      message: "Erreur lors de la récupération des retours",
      error: error.message
    });
  }
};

// Mettre à jour un retour
exports.updateRetour = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const retour = await Retour.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!retour) {
      return res.status(404).json({ message: "Retour non trouvé" });
    }

    res.status(200).json({
      message: "Retour mis à jour avec succès",
      retour
    });
  } catch (error) {
    console.error('Erreur lors de la mise à jour du retour:', error);
    res.status(500).json({
      message: "Erreur lors de la mise à jour du retour",
      error: error.message
    });
  }
};

// Supprimer un retour
exports.deleteRetour = async (req, res) => {
  try {
    const { id } = req.params;
    const retour = await Retour.findByIdAndDelete(id);

    if (!retour) {
      return res.status(404).json({ message: "Retour non trouvé" });
    }

    res.status(200).json({
      message: "Retour supprimé avec succès"
    });
  } catch (error) {
    console.error('Erreur lors de la suppression du retour:', error);
    res.status(500).json({
      message: "Erreur lors de la suppression du retour",
      error: error.message
    });
  }
}; 