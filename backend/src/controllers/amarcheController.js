const AMarche = require('../models/AMarche');

exports.createAMarche = async (req, res) => {
  try {
    const newMarche = new AMarche(req.body);
    await newMarche.save();
    res.status(201).json({ message: 'Marché enregistré avec succès', marche: newMarche });
  } catch (err) {
    console.error('Erreur lors de la création :', err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
};

// Ajout de la fonction pour récupérer tous les marchés
exports.getAllAMarches = async (req, res) => {
  try {
    const marches = await AMarche.find({});
    res.status(200).json(marches);
  } catch (err) {
    console.error('Erreur lors de la récupération des marchés:', err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
};

// Ajout de la fonction pour récupérer un marché spécifique par son marcheBC
exports.getAMarcheByMarcheBC = async (req, res) => {
  try {
    const { marcheBC } = req.params;
    // Utiliser une expression régulière pour une correspondance insensible à la casse
    const marche = await AMarche.findOne({ 
      marcheBC: { $regex: new RegExp(`^${marcheBC}$`, 'i') }
    });
    
    if (!marche) {
      console.log(`Marché non trouvé pour marcheBC: ${marcheBC}`);
      return res.status(404).json({ message: 'Marché non trouvé' });
    }
    
    res.status(200).json(marche);
  } catch (err) {
    console.error('Erreur lors de la récupération du marché:', err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
};

// Ajout de la fonction pour mettre à jour un marché existant par son marcheBC
exports.updateAMarcheByMarcheBC = async (req, res) => {
  try {
    const { marcheBC } = req.params;
    const updatedData = req.body;
    
    // Si le marcheBC dans les données est différent de celui dans l'URL,
    // cela signifie que l'utilisateur a modifié le code du marché
    const isMarcheBCChanged = updatedData.marcheBC !== marcheBC;
    
    if (isMarcheBCChanged) {
      console.log(`Changement de marcheBC détecté: ${marcheBC} -> ${updatedData.marcheBC}`);
      
      // Vérifier d'abord si un marché avec le nouveau code existe déjà
      const existingMarche = await AMarche.findOne({ marcheBC: updatedData.marcheBC });
      
      if (existingMarche) {
        // Si un marché avec ce code existe déjà, retourner une erreur
        return res.status(409).json({ 
          message: 'Un marché avec ce code existe déjà', 
          existingMarche: existingMarche.marcheBC 
        });
      }
      
      // Supprimer l'ancien marché
      await AMarche.findOneAndDelete({ marcheBC: marcheBC });
      
      // Créer un nouveau marché avec le nouveau code
      const newMarche = new AMarche(updatedData);
      await newMarche.save();
      
      return res.status(200).json({ 
        message: 'Marché mis à jour avec succès (code modifié)', 
        marche: newMarche,
        oldCode: marcheBC,
        newCode: updatedData.marcheBC
      });
    }
    
    // Cas standard: mise à jour sans changement de code
    const updatedMarche = await AMarche.findOneAndUpdate(
      { marcheBC: marcheBC }, 
      updatedData, 
      { new: true, runValidators: true }
    );
    
    if (!updatedMarche) {
      return res.status(404).json({ message: 'Marché non trouvé' });
    }
    
    res.status(200).json({ message: 'Marché mis à jour avec succès', marche: updatedMarche });
  } catch (err) {
    console.error('Erreur lors de la mise à jour du marché:', err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
};

// Ajout de la fonction pour supprimer un marché par son marcheBC
exports.deleteAMarcheByMarcheBC = async (req, res) => {
  try {
    const { marcheBC } = req.params;
    await AMarche.findOneAndDelete({ marcheBC: marcheBC });
    res.status(200).json({ message: 'Marché supprimé avec succès' });
  } catch (err) {
    console.error('Erreur lors de la suppression du marché:', err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
};

// Nouvelle fonction pour mettre à jour les detailsPrix d'un detailProjet spécifique d'un marché
exports.updateDetailsPrix = async (req, res) => {
  try {
    const { marcheBC, numeroPrix } = req.params;
    const newDetailsPrix = req.body;
    
    console.log(`Mise à jour des detailsPrix pour marcheBC=${marcheBC}, numeroPrix=${numeroPrix}`);
    console.log('Données reçues:', newDetailsPrix);
    
    // Récupérer le marché
    const marche = await AMarche.findOne({ marcheBC: marcheBC });
    
    if (!marche) {
      return res.status(404).json({ message: 'Marché non trouvé' });
    }
    
    // Trouver le detailProjet correspondant au numeroPrix
    const detailProjetIndex = marche.detailProjet.findIndex(
      detail => detail.numeroPrix === numeroPrix
    );
    
    if (detailProjetIndex === -1) {
      return res.status(404).json({ message: 'Detail projet non trouvé' });
    }
    
    const detailProjet = marche.detailProjet[detailProjetIndex];
    
    // Trouver le detailPrix correspondant à la référence
    const detailsPrixIndex = detailProjet.detailsPrix.findIndex(
      detail => detail.reference === newDetailsPrix.reference
    );

    // Utiliser le receptionId fourni dans la requête
    const receptionId = newDetailsPrix.receptionId;

    if (detailsPrixIndex !== -1) {
      // Récupérer le detailPrix existant
      const detailPrix = detailProjet.detailsPrix[detailsPrixIndex];
      
      // Initialiser le tableau receptions s'il n'existe pas
      if (!detailPrix.receptions) {
        detailPrix.receptions = [];
      }

      // Créer un objet réception pour chaque paire sn/codeBarre
      const nouvellesReceptions = newDetailsPrix.sn.map((sn, index) => ({
        receptionId: receptionId,  // Utiliser l'ID fourni
        quantiteLivree: 1,
        dateReception: newDetailsPrix.dateReception,
        sn: sn,
        codeBarre: newDetailsPrix.codeBarre[index],
        finGarantie: newDetailsPrix.finGarantie
      }));

      // Ajouter les nouvelles réceptions au tableau existant
      detailPrix.receptions.push(...nouvellesReceptions);

      // Mettre à jour la quantité totale livrée
      detailPrix.quantiteLivree = (detailPrix.quantiteLivree || 0) + parseInt(newDetailsPrix.quantiteLivree);
      
    } else {
      // Si le detailPrix n'existe pas, le créer avec le tableau receptions initial
      const receptions = newDetailsPrix.sn.map((sn, index) => ({
        receptionId: receptionId,  // Utiliser l'ID fourni
        quantiteLivree: 1,
        dateReception: newDetailsPrix.dateReception,
        sn: sn,
        codeBarre: newDetailsPrix.codeBarre[index],
        finGarantie: newDetailsPrix.finGarantie
      }));

      // Ajouter le nouveau detailPrix avec son tableau de receptions
      detailProjet.detailsPrix.push({
        reference: newDetailsPrix.reference,
        designation: newDetailsPrix.designation,
        typeProduit: newDetailsPrix.typeProduit,
        marque: newDetailsPrix.marque,
        quantiteLivree: parseInt(newDetailsPrix.quantiteLivree),
        receptions: receptions
      });
    }
    
    // Sauvegarder les modifications
    await marche.save();
    
    // Renvoyer le receptionId dans la réponse
    res.status(200).json({ 
      message: 'DetailsPrix mis à jour avec succès',
      receptionId: receptionId
    });
    
  } catch (error) {
    console.error('Erreur lors de la mise à jour des detailsPrix:', error);
    res.status(500).json({ message: 'Erreur lors de la mise à jour des detailsPrix' });
  }
};