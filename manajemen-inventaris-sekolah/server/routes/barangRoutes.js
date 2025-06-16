const express = require('express');
const router = express.Router();
const barangController = require('../controllers/barangController');
const authMiddleware = require('../middleware/authMiddleware');

/**
 * Barang (Inventory Item) routes
 */

// Get all items - accessible by all authenticated users
router.get('/', authMiddleware.authenticate, barangController.getAll);

// Get single item by ID - accessible by all authenticated users
router.get('/:id', authMiddleware.authenticate, barangController.getById);

// Create new item - only admin and petugas can create items
router.post('/', 
  authMiddleware.authenticate, 
  authMiddleware.isAdminOrPetugas, 
  barangController.create
);

// Update item - only admin and petugas can update items
router.put('/:id', 
  authMiddleware.authenticate, 
  authMiddleware.isAdminOrPetugas, 
  barangController.update
);

// Delete item - only admin and petugas can delete items
router.delete('/:id', 
  authMiddleware.authenticate, 
  authMiddleware.isAdminOrPetugas, 
  barangController.delete
);

// Update item condition - only admin and petugas can update item condition
router.patch('/:id/kondisi', 
  authMiddleware.authenticate, 
  authMiddleware.isAdminOrPetugas, 
  barangController.updateKondisi
);

// Import items from CSV/Excel - admin only
router.post('/import', 
  authMiddleware.authenticate, 
  authMiddleware.isAdmin, 
  barangController.importBarang
);

// Export items to CSV/Excel - admin and petugas can export
router.get('/export', 
  authMiddleware.authenticate, 
  authMiddleware.isAdminOrPetugas, 
  barangController.exportBarang
);

module.exports = router;