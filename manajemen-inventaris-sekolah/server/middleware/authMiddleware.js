const jwt = require('jsonwebtoken');
const { User } = require('../models');
const config = require('../config/config');
const { UnauthorizedError, ForbiddenError } = require('../utils/errors');

/**
 * Authentication middleware
 */
const authMiddleware = {
  /**
   * Verify JWT token and attach user to request
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next middleware function
   */
  authenticate: async (req, res, next) => {
    try {
      // Get the token from Authorization header
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        throw new UnauthorizedError('Authentication token required');
      }

      const token = authHeader.split(' ')[1];
      
      // Verify token
      let decoded;
      try {
        decoded = jwt.verify(token, config.jwt.secret);
      } catch (error) {
        if (error.name === 'TokenExpiredError') {
          throw new UnauthorizedError('Token expired');
        }
        throw new UnauthorizedError('Invalid token');
      }
      
      // Find user
      const user = await User.findByPk(decoded.id, {
        attributes: { exclude: ['password'] }
      });
      
      if (!user) {
        throw new UnauthorizedError('User not found');
      }
      
      // Check if user is active
      if (user.status !== 'active') {
        throw new UnauthorizedError('User account is inactive');
      }
      
      // Attach user to request
      req.user = user;
      
      next();
    } catch (error) {
      next(error);
    }
  },
  
  /**
   * Check if user has admin role
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next middleware function
   */
  isAdmin: (req, res, next) => {
    if (!req.user || req.user.role !== 'admin') {
      return next(new ForbiddenError('Admin access required'));
    }
    next();
  },
  
  /**
   * Check if user has admin or petugas role
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next middleware function
   */
  isAdminOrPetugas: (req, res, next) => {
    if (!req.user || (req.user.role !== 'admin' && req.user.role !== 'petugas')) {
      return next(new ForbiddenError('Admin or Petugas access required'));
    }
    next();
  },
  
  /**
   * Check if user has specified role
   * @param {Array} roles - Array of allowed roles
   * @returns {Function} Middleware function
   */
  hasRole: (roles) => {
    return (req, res, next) => {
      if (!req.user || !roles.includes(req.user.role)) {
        return next(new ForbiddenError('Insufficient permissions'));
      }
      next();
    };
  },
  
  /**
   * Check if user owns the resource or has admin/petugas role
   * @param {Function} getResourceUserId - Function to extract user ID from resource
   * @returns {Function} Middleware function
   */
  isOwnerOrAdmin: (getResourceUserId) => {
    return async (req, res, next) => {
      try {
        // Admin and petugas can access any resource
        if (req.user.role === 'admin' || req.user.role === 'petugas') {
          return next();
        }
        
        // Extract resource owner ID
        const resourceUserId = await getResourceUserId(req);
        
        // Check if user is the owner
        if (req.user.id !== resourceUserId) {
          return next(new ForbiddenError('You do not have permission to access this resource'));
        }
        
        next();
      } catch (error) {
        next(error);
      }
    };
  },
  
  /**
   * Optional authentication - attach user to request if token is valid,
   * but don't throw an error if token is missing or invalid
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next middleware function
   */
  optional: async (req, res, next) => {
    try {
      // Get the token from Authorization header
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return next();
      }

      const token = authHeader.split(' ')[1];
      
      // Verify token
      let decoded;
      try {
        decoded = jwt.verify(token, config.jwt.secret);
      } catch (error) {
        return next();
      }
      
      // Find user
      const user = await User.findByPk(decoded.id, {
        attributes: { exclude: ['password'] }
      });
      
      if (user && user.status === 'active') {
        // Attach user to request
        req.user = user;
      }
      
      next();
    } catch (error) {
      next();
    }
  }
};

module.exports = authMiddleware;