const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const authMiddleware = require('../middleware/authMiddleware');

/**
 * User routes
 */

// Get all users - only admin and petugas can see all users
router.get('/', 
  authMiddleware.authenticate, 
  authMiddleware.isAdminOrPetugas, 
  userController.getAll
);

// Get a single user by ID
// Users can only view their own profile unless they're admin/petugas
router.get('/:id', 
  authMiddleware.authenticate, 
  userController.getById
);

// Create a new user - only admin can create users
router.post('/', 
  authMiddleware.authenticate, 
  authMiddleware.isAdmin, 
  userController.create
);

// Update a user's profile
// Users can only update their own profile unless they're admin
router.put('/:id', 
  authMiddleware.authenticate, 
  userController.update
);

// Update a user's role - only admin can update roles
router.patch('/:id/role', 
  authMiddleware.authenticate, 
  authMiddleware.isAdmin, 
  userController.updateRole
);

// Update a user's status (active/inactive) - only admin can update status
router.patch('/:id/status', 
  authMiddleware.authenticate, 
  authMiddleware.isAdmin, 
  userController.updateStatus
);

// Reset a user's password - only admin can reset passwords
router.post('/:id/reset-password', 
  authMiddleware.authenticate, 
  authMiddleware.isAdmin, 
  userController.resetPassword
);

// Delete a user - only admin can delete users
router.delete('/:id', 
  authMiddleware.authenticate, 
  authMiddleware.isAdmin, 
  userController.delete
);

// Get a user's loan history
// Users can only see their own history unless they're admin/petugas
router.get('/:id/loan-history', 
  authMiddleware.authenticate, 
  userController.getLoanHistory
);

module.exports = router;