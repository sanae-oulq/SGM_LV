const Affectation = require('../models/Affectation');
const AMarche = require('../models/AMarche');

// Nouvelle fonction pour récupérer toutes les affectations
exports.getAllAffectations = async (req, res) => {
  try {
    const affectations = await Affectation.find().sort({ dateAffectation: -1 });
    
    // Pour chaque affectation, récupérer les détails du marché
    const affectationsWithDetails = await Promise.all(affectations.map(async (affectation) => {
      const marche = await AMarche.findById(affectation.idMarche);
      if (marche) {
        // Trouver les détails de la réception dans le marché
        const reception = marche.detailProjet.reduce((found, projet) => {
          if (found) return found;
          return projet.detailsPrix.reduce((foundInPrix, prix) => {
            if (foundInPrix) return foundInPrix;
            const reception = (prix.receptions || []).find(r => r.sn === affectation.snReception);
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
          ...affectation.toObject(),
          codeProduit: reception ? reception.codeProduit : '',
          designation: reception ? reception.designation : ''
        };
      }
      return affectation;
    }));

    res.status(200).json(affectationsWithDetails);
  } catch (error) {
    console.error('Erreur lors de la récupération des affectations:', error);
    res.status(500).json({
      message: "Erreur lors de la récupération des affectations",
      error: error.message
    });
  }
};

// Nouvelle fonction pour créer plusieurs affectations
exports.createMultipleAffectations = async (req, res) => {
  console.log('Requête reçue dans createMultipleAffectations');
  console.log('Body:', req.body);
  
  try {
    const { affectations } = req.body;

    if (!Array.isArray(affectations) || affectations.length === 0) {
      return res.status(400).json({ message: "Le champ 'affectations' doit être un tableau non vide" });
    }

    console.log('Nombre total d\'affectations reçues:', affectations.length);

    const results = await Promise.all(
      affectations.map(async (affectationData) => {
        try {
          console.log('Traitement de l\'affectation:', { affectationId: affectationData.affectationId, snReception: affectationData.snReception });

          // Rechercher le marché correspondant pour obtenir l'idMarche
          const marche = await AMarche.findOne({ marcheBC: affectationData.marcheBC });
          if (!marche) {
            throw new Error(`Marché non trouvé pour marcheBC: ${affectationData.marcheBC}`);
          }

          // Vérifier si des affectations existent déjà pour ce SN
          const existingAffectations = await Affectation.find({ snReception: affectationData.snReception });

          if (existingAffectations && existingAffectations.length > 0) {
            console.log('Affectations existantes trouvées:', existingAffectations.length);

            // Mettre à jour l'état de toutes les affectations existantes à "Affecté"
            const updatePromises = existingAffectations.map(async (existingAff) => {
              existingAff.etat = "Affecté";
              return existingAff.save();
            });
            await Promise.all(updatePromises);
            console.log('États des affectations existantes mis à jour');
            
            // Créer une nouvelle affectation avec l'idMarche
            const newAffectation = new Affectation({
              affectationId: affectationData.affectationId,
              dateAffectation: new Date(affectationData.dateAffectation),
              typeAffectation: affectationData.typeAffectation,
              idMarche: marche._id, // Utiliser l'ID du marché trouvé
              marcheBC: affectationData.marcheBC,
              numPrix: affectationData.numPrix || '',
              snReception: affectationData.snReception,
              codeBarre: affectationData.codeBarre || existingAffectations[0].codeBarre,
              codeChaine: affectationData.codeChaine,
              nomChaine: affectationData.nomChaine || '',
              service: affectationData.service,
              utilisateur: affectationData.utilisateur,
              lieu: affectationData.lieu || '',
              evenement: affectationData.evenement || '',
              qualite: affectationData.qualite || '',
              memo: affectationData.memo || '',
              etat: 'Affecté'
            });

            console.log('Tentative de sauvegarde de la nouvelle affectation');
            const savedNewAffectation = await newAffectation.save();
            console.log('Nouvelle affectation sauvegardée avec succès:', savedNewAffectation._id);

            return {
              status: 'created',
              data: savedNewAffectation
            };
          }

          // Si aucune affectation n'existe, créer une nouvelle avec l'idMarche
          const newAffectation = new Affectation({
            affectationId: affectationData.affectationId,
            dateAffectation: new Date(affectationData.dateAffectation),
            typeAffectation: affectationData.typeAffectation,
            idMarche: marche._id, // Utiliser l'ID du marché trouvé
            marcheBC: affectationData.marcheBC,
            numPrix: affectationData.numPrix || '',
            snReception: affectationData.snReception,
            codeBarre: affectationData.codeBarre || affectationData.snReception,
            codeChaine: affectationData.codeChaine,
            nomChaine: affectationData.nomChaine || '',
            service: affectationData.service,
            utilisateur: affectationData.utilisateur,
            lieu: affectationData.lieu || '',
            evenement: affectationData.evenement || '',
            qualite: affectationData.qualite || '',
            memo: affectationData.memo || '',
            etat: 'Affecté'
          });

          console.log('Tentative de sauvegarde de la nouvelle affectation');
          const savedAffectation = await newAffectation.save();
          console.log('Nouvelle affectation sauvegardée avec succès:', savedAffectation._id);

          return {
            status: 'created',
            data: savedAffectation
          };
        } catch (error) {
          console.error('Erreur lors du traitement de l\'affectation:', error);
          return {
            status: 'error',
            error: error.message,
            affectationData: affectationData
          };
        }
      })
    );

    // Analyser les résultats
    const created = results.filter(r => r.status === 'created').map(r => r.data);
    const errors = results.filter(r => r.status === 'error');

    res.status(200).json({
      message: "Traitement terminé",
      summary: {
        totalProcessed: results.length,
        created: created.length,
        errors: errors.length
      },
      created,
      errors
    });

  } catch (error) {
    console.error('Erreur détaillée:', error);
    res.status(500).json({
      message: "Erreur lors de la création des affectations",
      error: error.message
    });
  }
};

exports.createAffectation = async (req, res) => {
  console.log('Requête reçue dans createAffectation');
  console.log('Body:', req.body);
  
  try {
    const {
      dateAffectation,
      typeAffectation,
      idMarche,
      marcheBC,
      numPrix,
      numReception,
      snReception,
      codeBarre,
      codeChaine,
      nomChaine,
      service,
      utilisateur,
      lieu,
      evenement,
      qualite,
      memo,
      etat
    } = req.body;

    console.log('Données extraites:', {
      dateAffectation,
      typeAffectation,
      idMarche,
      marcheBC,
      numPrix,
      numReception,
      etat
    });

    // Vérifier que le marché existe
    console.log('Recherche du marché avec ID:', idMarche);
    const marche = await AMarche.findById(idMarche);
    if (!marche) {
      console.log('Marché non trouvé');
      return res.status(404).json({ message: "Marché non trouvé" });
    }
    console.log('Marché trouvé:', marche.marcheBC);

    // Créer la nouvelle affectation
    const newAffectation = new Affectation({
      dateAffectation: new Date(dateAffectation),
      typeAffectation,
      idMarche,
      marcheBC,
      numPrix,
      numReception,
      snReception,
      codeBarre,
      codeChaine,
      nomChaine,
      service,
      utilisateur,
      lieu,
      evenement,
      qualite,
      memo,
      etat
    });

    console.log('Nouvelle affectation créée:', newAffectation);

    // Sauvegarder l'affectation
    await newAffectation.save();
    console.log('Affectation sauvegardée avec succès');

    res.status(201).json({
      message: "Affectation créée avec succès",
      affectation: newAffectation
    });

  } catch (error) {
    console.error('Erreur détaillée:', error);
    res.status(500).json({
      message: "Erreur lors de la création de l'affectation",
      error: error.message,
      stack: error.stack
    });
  }
};

// Nouvelle fonction pour récupérer les affectations par marcheBC
exports.getAffectationsByMarche = async (req, res) => {
  try {
    const { marcheBC, affectationId } = req.query;
    
    if (!marcheBC) {
      return res.status(400).json({ message: "Le numéro de marché est requis" });
    }

    let query = { marcheBC };
    if (affectationId) {
      query.affectationId = affectationId;
    }

    const affectations = await Affectation.find(query);
    res.status(200).json(affectations);

  } catch (error) {
    console.error('Erreur lors de la récupération des affectations:', error);
    res.status(500).json({
      message: "Erreur lors de la récupération des affectations",
      error: error.message
    });
  }
};

// Mettre à jour l'état d'une affectation
exports.updateAffectationEtat = async (req, res) => {
    try {
        const { sn } = req.params;
        const { etat } = req.body;

        if (!etat) {
            return res.status(400).json({ message: "L'état est requis" });
        }

        // Trouver toutes les affectations avec le même SN
        const affectations = await Affectation.find({ snReception: sn });

        if (!affectations || affectations.length === 0) {
            return res.status(404).json({ message: "Affectation non trouvée" });
        }

        // Mettre à jour l'état de toutes les affectations trouvées
        const updatePromises = affectations.map(async (affectation) => {
            affectation.etat = etat;
            return affectation.save();
        });

        await Promise.all(updatePromises);

        res.json({ 
            success: true,
            message: "État des affectations mis à jour avec succès", 
            affectations 
        });
    } catch (error) {
        console.error('Erreur lors de la mise à jour de l\'état des affectations:', error);
        res.status(500).json({ 
            success: false,
            message: "Erreur lors de la mise à jour de l'état des affectations",
            error: error.message 
        });
    }
}; 