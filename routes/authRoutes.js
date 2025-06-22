// routes/authRoutes.js
const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { ensureGuest, ensureAuthenticated } = require('../middleware/auth');

// Login routes
router.get('/login', ensureGuest, authController.showLoginForm);
router.post('/login', authController.login);

// Register routes
router.get('/register', ensureGuest, authController.showRegisterForm);
router.post('/register', authController.register);

// Logout route
router.get('/logout', ensureAuthenticated, authController.logout);

module.exports = router;