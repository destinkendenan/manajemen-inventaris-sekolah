const { Sequelize } = require('sequelize');
const logger = require('../utils/logger');
const { 
  ValidationError, 
  NotFoundError, 
  UnauthorizedError, 
  ForbiddenError 
} = require('../utils/errors');

/**
 * Error handling middleware
 * @param {Error} err - Error object
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const errorMiddleware = (err, req, res, next) => {
  // Log the error
  logger.error(`${err.name}: ${err.message}`, {
    path: req.path,
    method: req.method,
    ...(req.user && { userId: req.user.id }),
    stack: process.env.NODE_ENV !== 'production' ? err.stack : undefined
  });

  // Handle custom application errors
  if (err instanceof ValidationError) {
    return res.status(400).json({
      status: 'error',
      message: err.message
    });
  }

  if (err instanceof NotFoundError) {
    return res.status(404).json({
      status: 'error',
      message: err.message
    });
  }

  if (err instanceof UnauthorizedError) {
    return res.status(401).json({
      status: 'error',
      message: err.message
    });
  }

  if (err instanceof ForbiddenError) {
    return res.status(403).json({
      status: 'error',
      message: err.message
    });
  }

  // Handle Sequelize errors
  if (err instanceof Sequelize.ValidationError) {
    const errors = err.errors.map(e => e.message);
    return res.status(400).json({
      status: 'error',
      message: 'Validation error',
      errors
    });
  }

  if (err instanceof Sequelize.UniqueConstraintError) {
    const errors = err.errors.map(e => e.message);
    return res.status(400).json({
      status: 'error',
      message: 'Data already exists',
      errors
    });
  }

  if (err instanceof Sequelize.ForeignKeyConstraintError) {
    return res.status(400).json({
      status: 'error',
      message: 'Foreign key constraint error'
    });
  }

  if (err instanceof Sequelize.DatabaseError) {
    return res.status(500).json({
      status: 'error',
      message: 'Database error',
      ...(process.env.NODE_ENV !== 'production' && { error: err.message })
    });
  }

  // Handle JSON parse errors
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    return res.status(400).json({
      status: 'error',
      message: 'Invalid JSON'
    });
  }

  // Handle JWT errors
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      status: 'error',
      message: 'Invalid token'
    });
  }

  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({
      status: 'error',
      message: 'Token expired'
    });
  }

  // Handle multer errors
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({
      status: 'error',
      message: 'File too large'
    });
  }

  if (err.code === 'LIMIT_UNEXPECTED_FILE') {
    return res.status(400).json({
      status: 'error',
      message: 'Unexpected file'
    });
  }

  // Handle all other errors
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';

  res.status(statusCode).json({
    status: 'error',
    message,
    // Only include stack trace in development
    ...(process.env.NODE_ENV !== 'production' && { stack: err.stack })
  });
};

module.exports = errorMiddleware;