const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const authMiddleware = require('../middleware/authMiddleware');

/**
 * Authentication routes
 */

// Public routes (no authentication required)
router.post('/register', authController.register);
router.post('/login', authController.login);

// Protected routes (authentication required)
router.get('/me', authMiddleware.authenticate, authController.me);
router.post('/change-password', authMiddleware.authenticate, authController.changePassword);
router.post('/logout', authMiddleware.authenticate, authController.logout);

module.exports = router;