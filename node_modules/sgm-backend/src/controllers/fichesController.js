const Fiches = require('../models/Fiches');
const AMarche = require('../models/AMarche');

exports.createFiches = async (req, res) => {
  try {
    console.log('Requête reçue:', req.body);
    console.log('Fichiers reçus:', req.files);

    const { 
      intituleProjet,
      dateProjet,
      chefProjet,
      commission,
      marcheBC
    } = req.body;

    // Vérifier que tous les champs requis sont présents
    if (!intituleProjet || !dateProjet || !chefProjet || !commission || !marcheBC) {
      return res.status(400).json({ 
        message: "Tous les champs sont requis",
        missingFields: {
          intituleProjet: !intituleProjet,
          dateProjet: !dateProjet,
          chefProjet: !chefProjet,
          commission: !commission,
          marcheBC: !marcheBC
        }
      });
    }

    const ficheProjet = req.files && req.files['ficheProjet'] ? req.files['ficheProjet'][0] : null;
    const ficheAffectation = req.files && req.files['ficheAffectation'] ? req.files['ficheAffectation'][0] : null;

    console.log('Fichiers traités:', { ficheProjet, ficheAffectation });

    // Vérifier d'abord que le marcheBC existe et récupérer son ID
    const projet = await AMarche.findOne({ marcheBC });
    if (!projet) {
      return res.status(404).json({ message: "Marche/BC non trouvé." });
    }

    // Créer et sauvegarder la fiche avec l'ID du marché
    const newFiche = new Fiches({
      intituleProjet,
      dateProjet,
      chefProjet,
      commission,
      marcheBC,
      marcheId: projet._id,
      ficheProjet: ficheProjet ? ficheProjet.path : null,
      ficheAffectation: ficheAffectation ? ficheAffectation.path : null
    });

    console.log('Nouvelle fiche à sauvegarder:', newFiche);

    await newFiche.save();
    console.log('Fiche sauvegardée avec succès');
    res.status(201).json(newFiche);

  } catch (error) {
    console.error('Erreur détaillée:', error);
    res.status(500).json({ 
      message: "Erreur lors de la création de la fiche.",
      error: error.message,
      stack: error.stack
    });
  }
};
