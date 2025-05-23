const mongoose = require('mongoose');
const { string } = require('prop-types');

const receptionSchema = new mongoose.Schema({
  receptionId: String,
  quantiteLivree: Number,
  dateReception: String,
  sn: String,
  codeBarre: String,
  finGarantie: String
});

const detailsPrixSchema = new mongoose.Schema({
  reference: String,
  designation: String,
  typeProduit: String,
  marque: String,
  quantiteLivree: Number,
  receptions: [receptionSchema]
});

const detailProjetSchema = new mongoose.Schema({
  numeroPrix: String,
  unite: String,
  quantite: Number,
  prixUnitaire: Number,
  objetPrix: String,
  numLot: String,
  prixTotalHTVA: Number,
  detailsPrix: [detailsPrixSchema]
});

const amarcheSchema = new mongoose.Schema({
  marcheBC: String,
  date: String,
  anneeMarche: String,
  typeMarche: String,
  marcheBCType: {
    type: String,
    enum: ['marche', 'bc'],
    required: true,
    default: 'marche'
  },
  familleProjet: String,
  intituleProjet: String,
  fournisseur: String,
  demandeur: String,
  ficheProjet: String,
  descriptionProjet: String,
  garantie: String,
  delaiExecution: String,
  numAO: String,
  jde: String,
  detailProjet: [detailProjetSchema]
}, { timestamps: true });

module.exports = mongoose.model('AMarche', amarcheSchema);