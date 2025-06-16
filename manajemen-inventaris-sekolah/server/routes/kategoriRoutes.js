const express = require('express');
const router = express.Router();
const kategoriController = require('../controllers/kategoriController');
const authMiddleware = require('../middleware/authMiddleware');

/**
 * Kategori (Category) routes
 */

// Get all categories - accessible by all authenticated users
router.get('/', authMiddleware.authenticate, kategoriController.getAll);

// Get single category by ID - accessible by all authenticated users
router.get('/:id', authMiddleware.authenticate, kategoriController.getById);

// Create new category - only admin and petugas can create categories
router.post('/', 
  authMiddleware.authenticate, 
  authMiddleware.isAdminOrPetugas, 
  kategoriController.create
);

// Update category - only admin and petugas can update categories
router.put('/:id', 
  authMiddleware.authenticate, 
  authMiddleware.isAdminOrPetugas, 
  kategoriController.update
);

// Delete category - only admin and petugas can delete categories
router.delete('/:id', 
  authMiddleware.authenticate, 
  authMiddleware.isAdminOrPetugas, 
  kategoriController.delete
);

// Get item counts by categories (for statistics)
router.get('/stats/items-count', 
  authMiddleware.authenticate, 
  kategoriController.getItemsCount
);

module.exports = router;