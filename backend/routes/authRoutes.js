const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// Route Register -> Pastikan authController.register adalah fungsi biasa
router.post('/register', authController.register);

// Route Login -> Pastikan authController.login adalah fungsi biasa
router.post('/login', authController.login);

module.exports = router;