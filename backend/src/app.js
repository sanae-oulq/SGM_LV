require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const amarcheRoutes = require('./routes/amarcheRoutes');
const marcheDocumentRoutes = require('./routes/marcheDocument.routes');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const fichesRoutes = require('./routes/fichesRoutes');
app.use('/api', fichesRoutes);

// Routes pour les documents
const documentsRoutes = require('./routes/documentsRoutes');
app.use('/api/documents', documentsRoutes);
console.log('Routes documents chargées avec succès');

// Configuration des dossiers statiques
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Routes
try {
    // Routes pour ordre service (accepte singulier et pluriel)
    const ordreserviceRoutes = require('./routes/ordreserviceRoutes');
    app.use(['/api/ordreservice', '/api/ordreservices'], ordreserviceRoutes);
    console.log('Routes ordre service chargées avec succès');

    // Routes pour marches
    app.use('/api/amarches', amarcheRoutes);
    console.log('Routes marches chargées avec succès');

    // Routes pour PVRPT
    const pvrptRoutes = require('./routes/pvrptRoutes');
    app.use('/api/pvrpt', pvrptRoutes);
    console.log('Routes PVRPT chargées avec succès');

    // Routes pour attestation conformite
    const attestationConformiteRoutes = require('./routes/attestationConformiteRoutes');
    app.use('/api/attestation-conformite', attestationConformiteRoutes);
    console.log('Routes attestation conformite chargées avec succès');

    // Routes pour factures
    const factureRoutes = require('./routes/factureRoutes');
    app.use(['/api/facture', '/api/factures'], factureRoutes);
    console.log('Routes factures chargées avec succès');

    // Routes pour BRIs
    const brisRoutes = require('./routes/brisRoutes');
    app.use(['/api/bri', '/api/bris'], brisRoutes);
    console.log('Routes BRIs chargées avec succès');

    // Routes pour PV
    const pvRoutes = require('./routes/pvRoutes');
    app.use(['/api/pv', '/api/pvs'], pvRoutes);
    console.log('Routes PV chargées avec succès');

    // Routes pour SN
    const snRoutes = require('./routes/snRoutes');
    app.use(['/api/sn', '/api/sns'], snRoutes);
    console.log('Routes SN chargées avec succès');

    // Routes pour affectations
    const affectationRoutes = require('./routes/affectationRoutes');
    app.use('/api/affectations', affectationRoutes);
    console.log('Routes affectations chargées avec succès');

    // Routes pour retours
    const retourRoutes = require('./routes/retourRoutes');
    app.use('/api/retours', retourRoutes);
    console.log('Routes retours chargées avec succès'); 
    
    // Routes pour les documents d'affectation
    const affecDocumentRoutes = require('./routes/affecDocumentRoutes');
    app.use('/api/affecDocuments', affecDocumentRoutes);
    console.log('Routes documents d\'affectation chargées avec succès');

    // Routes pour les documents de retour
    const retourDocumentRoutes = require('./routes/retourDocumentRoutes');
    app.use('/api/retourDocuments', retourDocumentRoutes);
    console.log('Routes documents de retour chargées avec succès');

    // Routes pour les passations et leurs documents
    const passationRoutes = require('./routes/passationRoutes');
    const passationDocumentRoutes = require('./routes/passationDocumentRoutes');
    
    app.use('/api/passations', passationRoutes);
    app.use('/api/passationDocuments', passationDocumentRoutes);
    console.log('Routes passations et documents de passation chargées avec succès');

    // Routes pour les documents de marché
    app.use('/api/marche-documents', marcheDocumentRoutes);
    console.log('Routes documents de marché chargées avec succès');

    

} catch (error) {
    console.error('Erreur lors du chargement des routes:', error);
}

// Log détaillé des requêtes
app.use((req, res, next) => {
    console.log('-------------------');
    console.log('Nouvelle requête :');
    console.log(`${req.method} ${req.url}`);
    console.log('Headers:', req.headers);
    console.log('Body:', req.body);
    console.log('-------------------');
    next();
});

// Route de test
app.get('/', (req, res) => {
    res.json({ message: 'API SGM est en ligne' });
});

// Route de base
app.get('/', (req, res) => {
    console.log('Route racine appelée');
    res.json({ message: 'API SGM' });
});

// Connexion à MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/sgm', {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(() => console.log('Connecté à MongoDB'))
.catch(err => console.error('Erreur de connexion à MongoDB:', err));

// Gestion des erreurs de MongoDB
mongoose.connection.on('error', err => {
    console.error('Erreur MongoDB:', err);
});

// Gestion des erreurs globale
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        message: "Une erreur est survenue",
        error: process.env.NODE_ENV === 'development' ? err.message : 'Erreur interne du serveur'
    });
});

// Gestion des routes non trouvées
app.use((req, res) => {
    console.log(`Route non trouvée : ${req.method} ${req.url}`);
    res.status(404).json({
        message: 'Route non trouvée',
        path: req.url,
        method: req.method
    });
});

// Port d'écoute
const PORT = process.env.PORT || 5003;
app.listen(PORT, () => {
    console.log(`Serveur démarré sur le port ${PORT}`);
});

module.exports = app; 