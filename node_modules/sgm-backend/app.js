const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
const brisRoutes = require('./routes/brisRoutes');

// Assurez-vous que le dossier uploads/bris existe
const fs = require('fs');
const uploadsDir = './uploads';
const brisDirPath = './uploads/bris';

if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir);
}
if (!fs.existsSync(brisDirPath)) {
    fs.mkdirSync(brisDirPath);
}

// Servir les fichiers statiques
app.use('/uploads', express.static('uploads'));

// Routes API
app.use('/api/bris', brisRoutes);

module.exports = app; 