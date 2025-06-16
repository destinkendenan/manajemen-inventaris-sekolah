const express = require('express');
const router = express.Router();
const peminjamanController = require('../controllers/peminjamanController');
const authMiddleware = require('../middleware/authMiddleware');

/**
 * Peminjaman (Loan) routes
 */

// Get all loans with pagination and filtering
// Regular users can only see their own loans, admin/petugas can see all
router.get('/', authMiddleware.authenticate, peminjamanController.getAll);

// Get a single loan by ID
// Users can only view their own loans unless they're admin/petugas
router.get('/:id', authMiddleware.authenticate, peminjamanController.getById);

// Create a new loan request - all authenticated users can create loan requests
router.post('/', authMiddleware.authenticate, peminjamanController.create);

// Approve a loan request - only admin and petugas can approve
router.post('/:id/approve', 
  authMiddleware.authenticate, 
  authMiddleware.isAdminOrPetugas, 
  peminjamanController.approve
);

// Reject a loan request - only admin and petugas can reject
router.post('/:id/reject', 
  authMiddleware.authenticate, 
  authMiddleware.isAdminOrPetugas, 
  peminjamanController.reject
);

// Process item return - only admin and petugas can process returns
router.post('/:id/return', 
  authMiddleware.authenticate, 
  authMiddleware.isAdminOrPetugas, 
  peminjamanController.processReturn
);

// Cancel a loan request - users can cancel their own requests, admin/petugas can cancel any
router.post('/:id/cancel', 
  authMiddleware.authenticate, 
  peminjamanController.cancel
);

// Get user loan statistics - users can only see their own stats
router.get('/stats/user', 
  authMiddleware.authenticate, 
  peminjamanController.getUserStats
);

// Get overall loan statistics - only admin and petugas can see overall stats
router.get('/stats/overall', 
  authMiddleware.authenticate, 
  authMiddleware.isAdminOrPetugas, 
  peminjamanController.getOverallStats
);

module.exports = router;