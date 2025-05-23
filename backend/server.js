require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const amarcheRoutes = require('./src/routes/amarcheRoutes');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Base de données
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/sgm', {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('Connecté à MongoDB'))
.catch(err => console.error('Erreur de connexion à MongoDB:', err));

// Routes
app.use('/api/amarches', amarcheRoutes);

// Route de test
app.get('/', (req, res) => {
  res.json({ message: 'API SGM est en ligne' });
});

// Gestion des erreurs
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Quelque chose a mal tourné!');
});

// Port
const PORT = process.env.PORT || 5002;
app.listen(PORT, () => {
  console.log(`Serveur démarré sur le port ${PORT}`);
});