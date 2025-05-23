const mongoose = require('mongoose');
const Affectation = require('../models/Affectation');
const Passation = require('../models/passation');

// Créer une nouvelle passation
exports.createPassation = async (req, res) => {
  try {
    const {
      passationId,
      datePassation,
      typeAffectation,
      marcheBC,
      numPrix,
      snReception,
      codeBarre,
      codeProduit,
      designation,
      codeChaine,
      nomChaine,
      previousChaine,
      previousService,
      previousUser,
      newService,
      newUser,
      lieu,
      evenement,
      qualite,
      memo,
      affectationId
    } = req.body;

    // 1. Vérifier l'existence et l'état de l'affectation
    const affectation = await Affectation.findOne({ affectationId });
    if (!affectation) {
      return res.status(404).json({
        success: false,
        message: `L'affectation avec l'ID ${affectationId} n'existe pas`
      });
    }

    if (affectation.etat !== 'Affecté') {
      return res.status(400).json({
        success: false,
        message: `L'affectation n'est pas dans un état valide pour la passation (état actuel: ${affectation.etat})`
      });
    }

    // 3. Créer la nouvelle passation
    const passation = new Passation({
      passationId,
      datePassation,
      typeAffectation,
      marcheBC,
      numPrix,
      snReception,
      codeBarre,
      codeProduit,
      designation,
      codeChaine,
      nomChaine,
      previousChaine,
      previousService,
      previousUser,
      newService,
      newUser,
      lieu,
      evenement,
      qualite,
      memo,
      affectationId,
      etat: req.body.etat || 'Non passé'
    });

    await passation.save();

    // 4. Mettre à jour l'affectation
    const updatedAffectation = await Affectation.findOneAndUpdate(
      { affectationId },
      {
        $set: {
          service: newService,
          utilisateur: newUser,
          dateAffectation: new Date(),
          etat: 'Affecté',
          typeAffectation: typeAffectation
        }
      },
      { new: true }
    );

    if (!updatedAffectation) {
      // Si la mise à jour de l'affectation échoue, supprimer la passation créée
      await Passation.findOneAndDelete({ passationId });
      return res.status(500).json({
        success: false,
        message: 'Erreur lors de la mise à jour de l\'affectation'
      });
    }

    res.status(201).json({
      success: true,
      passation,
      affectation: updatedAffectation
    });

  } catch (error) {
    console.error('Erreur lors de la création de la passation:', error);
    
    let errorMessage = 'Erreur lors de la création de la passation';
    if (error.name === 'ValidationError') {
      errorMessage = Object.values(error.errors).map(err => err.message).join(', ');
    }
    
    res.status(500).json({
      success: false,
      message: errorMessage
    });
  }
};

// Récupérer toutes les passations
exports.getAllPassations = async (req, res) => {
  try {
    const passations = await Passation.find()
      .sort({ datePassation: -1 });
    res.status(200).json(passations);
  } catch (error) {
    console.error('Erreur lors de la récupération des passations:', error);
    res.status(500).json({ message: error.message });
  }
};

// Récupérer une passation par ID
exports.getPassationById = async (req, res) => {
  try {
    const passation = await Passation.findOne({ passationId: req.params.passationId });
    if (!passation) {
      return res.status(404).json({ message: 'Passation non trouvée' });
    }
    res.status(200).json(passation);
  } catch (error) {
    console.error('Erreur lors de la récupération de la passation:', error);
    res.status(500).json({ message: error.message });
  }
};

// Mettre à jour l'état d'une passation
exports.updatePassationStatus = async (req, res) => {
  try {
    const { etat } = req.body;
    const passationId = req.params.passationId;

    // 1. Vérifier que l'état est valide
    if (!['Passé', 'Non passé'].includes(etat)) {
      throw new Error('État invalide. Les états possibles sont: Passé, Non passé');
    }

    // 2. Mettre à jour la passation
    const passation = await Passation.findOneAndUpdate(
      { passationId },
      { $set: { etat } },
      { new: true }
    );

    if (!passation) {
      throw new Error('Passation non trouvée');
    }

    // 3. Mettre à jour l'affectation si la passation est marquée comme "Passé"
    if (etat === 'Passé') {
      const updatedAffectation = await Affectation.findOneAndUpdate(
        { affectationId: passation.affectationId },
        { $set: { etat: 'Passé' } },
        { new: true }
      );

      if (!updatedAffectation) {
        // Si la mise à jour de l'affectation échoue, annuler la mise à jour de la passation
        await Passation.findOneAndUpdate(
          { passationId },
          { $set: { etat: 'Non passé' } }
        );
        throw new Error('Erreur lors de la mise à jour de l\'affectation');
      }
    }

    res.status(200).json({
      success: true,
      passation
    });

  } catch (error) {
    console.error('Erreur lors de la mise à jour de l\'état de la passation:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Supprimer une passation
exports.deletePassation = async (req, res) => {
  try {
    const passation = await Passation.findOne({ passationId: req.params.id });
    
    if (!passation) {
      return res.status(404).json({ message: 'Passation non trouvée' });
    }

    // Si la passation était en cours, réinitialiser l'affectation
    if (passation.etat === 'Non passé') {
      const updatedAffectation = await Affectation.findOneAndUpdate(
        { affectationId: passation.affectationId },
        {
          $set: {
            service: passation.previousService,
            utilisateur: passation.previousUser,
            etat: 'Affecté'
          }
        },
        { new: true }
      );

      if (!updatedAffectation) {
        return res.status(500).json({
          message: 'Erreur lors de la réinitialisation de l\'affectation'
        });
      }
    }

    await Passation.findOneAndDelete({ passationId: req.params.id });
    
    res.status(200).json({ message: 'Passation supprimée avec succès' });
  } catch (error) {
    console.error('Erreur lors de la suppression de la passation:', error);
    res.status(500).json({ message: error.message });
  }
};

// Créer plusieurs passations en une seule requête
exports.createMultiplePassations = async (req, res) => {
  try {
    const { passations } = req.body;
    const createdPassations = [];

    for (const passationData of passations) {
      // Vérifier l'existence et l'état de l'affectation
      const affectation = await Affectation.findOne({ 
        affectationId: passationData.affectationId 
      });

      if (!affectation) {
        throw new Error(`L'affectation avec l'ID ${passationData.affectationId} n'existe pas`);
      }

      if (affectation.etat !== 'Affecté') {
        throw new Error(`L'affectation ${passationData.affectationId} n'est pas dans un état valide`);
      }

      const passation = new Passation({
        ...passationData,
        etat: passationData.etat || 'Non passé'
      });

      await passation.save();
      createdPassations.push(passation);
    }

    res.status(201).json({
      success: true,
      passations: createdPassations
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Récupérer les passations par session
exports.getPassationsBySession = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const passations = await Passation.find({ passationId: { $regex: sessionId } })
      .sort({ datePassation: -1 });
    
    res.status(200).json(passations);
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};

// Récupérer les passations par marché
exports.getPassationsByMarche = async (req, res) => {
  try {
    const { marcheBC } = req.params;
    const passations = await Passation.find({ marcheBC })
      .sort({ datePassation: -1 });
    
    res.status(200).json(passations);
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};

// Mettre à jour une passation
exports.updatePassation = async (req, res) => {
  try {
    const { passationId } = req.params;
    const updateData = req.body;

    const passation = await Passation.findOneAndUpdate(
      { passationId },
      { $set: updateData },
      { new: true }
    );

    if (!passation) {
      throw new Error('Passation non trouvée');
    }

    // Si le service ou l'utilisateur sont modifiés, mettre à jour l'affectation
    if (updateData.newService || updateData.newUser) {
      await Affectation.findOneAndUpdate(
        { affectationId: passation.affectationId },
        {
          $set: {
            service: updateData.newService || passation.newService,
            utilisateur: updateData.newUser || passation.newUser
          }
        }
      );
    }

    res.status(200).json({
      success: true,
      passation
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Récupérer les passations par service
exports.getPassationsByService = async (req, res) => {
  try {
    const { service } = req.params;
    const passations = await Passation.find({ 
      $or: [
        { previousService: service },
        { newService: service }
      ]
    }).sort({ datePassation: -1 });
    
    res.status(200).json(passations);
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};

// Récupérer les passations par utilisateur
exports.getPassationsByUser = async (req, res) => {
  try {
    const { utilisateur } = req.params;
    const passations = await Passation.find({ 
      $or: [
        { previousUser: utilisateur },
        { newUser: utilisateur }
      ]
    }).sort({ datePassation: -1 });
    
    res.status(200).json(passations);
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};

// Récupérer les passations par chaîne
exports.getPassationsByChaine = async (req, res) => {
  try {
    const { codeChaine } = req.params;
    const passations = await Passation.find({ codeChaine })
      .sort({ datePassation: -1 });
    
    res.status(200).json(passations);
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};

// Récupérer les passations par période
exports.getPassationsByPeriode = async (req, res) => {
  try {
    const { debut, fin } = req.params;
    const passations = await Passation.find({
      datePassation: {
        $gte: new Date(debut),
        $lte: new Date(fin)
      }
    }).sort({ datePassation: -1 });
    
    res.status(200).json(passations);
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
}; 