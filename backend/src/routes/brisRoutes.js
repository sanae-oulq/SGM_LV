const express = require('express');
const router = express.Router();
const brisController = require('../controllers/brisController');
const { upload, handleMulterError } = require('../middleware/upload');

// Routes
router.get('/check', brisController.checkExists);
router.post('/', upload.single('file'), brisController.create);
router.get('/', brisController.getAll);
router.get('/marche/:marcheBC', brisController.getByMarche);
router.delete('/delete', brisController.delete);
router.get('/:id/download', brisController.download);

// Add error handling middleware
router.use(handleMulterError);

module.exports = router; 