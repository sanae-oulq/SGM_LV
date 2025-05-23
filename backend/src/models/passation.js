const mongoose = require('mongoose');

const passationSchema = new mongoose.Schema({
  passationId: {
    type: String,
    required: true,
  
  },
  datePassation: {
    type: Date,
    required: true,
    validate: {
      validator: function(v) {
        return v instanceof Date && !isNaN(v) && v <= new Date();
      },
      message: 'La date de passation doit être valide et ne peut pas être dans le futur!'
    }
  },
  typeAffectation: {
    type: String,
    required: true,
    enum: ['Definitive', 'Provisoire']
  },
  marcheBC: {
    type: String,
    required: true,
    maxlength: [50, 'Le numéro de marché ne peut pas dépasser 50 caractères']
  },
  numPrix: {
    type: String,
    required: true,
    maxlength: [20, 'Le numéro de prix ne peut pas dépasser 20 caractères']
  },
  snReception: {
    type: String,
    required: true,
    maxlength: [50, 'Le numéro de série ne peut pas dépasser 50 caractères']
  },
  codeBarre: {
    type: String,
    required: true,
    maxlength: [50, 'Le code-barre ne peut pas dépasser 50 caractères']
  },
  codeProduit: {
    type: String,
    required: true,
    maxlength: [50, 'Le code produit ne peut pas dépasser 50 caractères']
  },
  designation: {
    type: String,
    required: true,
    maxlength: [200, 'La désignation ne peut pas dépasser 200 caractères']
  },
  codeChaine: {
    type: String,
    required: true,
    maxlength: [20, 'Le code chaîne ne peut pas dépasser 20 caractères']
  },
  nomChaine: {
    type: String,
    required: true,
    maxlength: [100, 'Le nom de la chaîne ne peut pas dépasser 100 caractères']
  },
  previousChaine: { 
    type: String 
  },

  previousService: {
    type: String,
    required: true,
    maxlength: [100, 'Le service précédent ne peut pas dépasser 100 caractères']
  },
  previousUser: {
    type: String,
    required: true,
    maxlength: [100, 'L\'utilisateur précédent ne peut pas dépasser 100 caractères']
  },
  newService: {
    type: String,
    required: true,
    maxlength: [100, 'Le nouveau service ne peut pas dépasser 100 caractères']
  },
  newUser: {
    type: String,
    required: true,
    maxlength: [100, 'Le nouvel utilisateur ne peut pas dépasser 100 caractères']
  },
  lieu: {
    type: String,
    maxlength: [200, 'Le lieu ne peut pas dépasser 200 caractères']
  },
  evenement: {
    type: String,
    maxlength: [200, 'L\'événement ne peut pas dépasser 200 caractères']
  },
  qualite: {
    type: String,
    maxlength: [100, 'La qualité ne peut pas dépasser 100 caractères']
  },
  memo: {
    type: String,
    maxlength: [500, 'Le mémo ne peut pas dépasser 500 caractères']
  },
  etat: {
    type: String,
    enum: ['Passé', 'Non passé'],
    default: 'Non passé',
    required: true
  },
  affectationId: {
    type: String,
    required: true
  }
}, {
  timestamps: true
});

// Middleware de pré-validation
passationSchema.pre('validate', async function(next) {
  if (this.isNew) {
    // Vérifier que la date n'est pas dans le futur
    if (this.datePassation > new Date()) {
      next(new Error('La date de passation ne peut pas être dans le futur'));
    }
    
    // Vérifier que le nouveau service est différent du service précédent
    if (this.newService === this.previousService) {
      next(new Error('Le nouveau service doit être différent du service précédent'));
    }
  }
  next();
});

module.exports = mongoose.model('Passation', passationSchema); 