const mongoose = require('mongoose');

const fichesSchema = new mongoose.Schema({
  intituleProjet: { type: String, required: true },
  dateProjet: { type: String, required: true },
  chefProjet: { type: String, required: true },
  commission: { type: String, required: true },
  ficheProjet: { type: String }, // rendu optionnel
  ficheAffectation: { type: String }, // rendu optionnel
  
  // Clé étrangère pour le numéro de marché
  marcheBC: {
    type: String,
    required: true,
    ref: 'AMarche'
  },
  
  // Clé étrangère pour l'ID du marché
  marcheId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'AMarche'
  }
}, { timestamps: true });

module.exports = mongoose.model('Fiches', fichesSchema);
