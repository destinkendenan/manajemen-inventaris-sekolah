const jwt = require('jsonwebtoken');
const config = require('../config/config');
const { UnauthorizedError } = require('./errors');

/**
 * JWT utilities for token generation and verification
 */
const jwtUtils = {
  /**
   * Generate an access token for a user
   * @param {Object} user - User object containing id, email, and role
   * @returns {String} JWT token
   */
  generateAccessToken: (user) => {
    return jwt.sign(
      { 
        id: user.id, 
        email: user.email, 
        role: user.role 
      },
      config.jwt.secret,
      { 
        expiresIn: config.jwt.expiresIn,
        algorithm: config.jwt.algorithm
      }
    );
  },

  /**
   * Generate a refresh token for a user
   * @param {Object} user - User object containing id
   * @returns {String} JWT refresh token
   */
  generateRefreshToken: (user) => {
    return jwt.sign(
      { id: user.id },
      config.jwt.secret,
      { 
        expiresIn: config.jwt.refreshExpiresIn,
        algorithm: config.jwt.algorithm
      }
    );
  },

  /**
   * Generate a password reset token
   * @param {Object} user - User object containing id
   * @returns {String} JWT password reset token
   */
  generatePasswordResetToken: (user) => {
    return jwt.sign(
      { 
        id: user.id, 
        purpose: 'password_reset' 
      },
      config.jwt.secret,
      { 
        expiresIn: '1h',
        algorithm: config.jwt.algorithm
      }
    );
  },

  /**
   * Verify a JWT token
   * @param {String} token - JWT token to verify
   * @returns {Object} Decoded token payload
   * @throws {UnauthorizedError} If token is invalid or expired
   */
  verifyToken: (token) => {
    try {
      return jwt.verify(token, config.jwt.secret);
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        throw new UnauthorizedError('Token expired');
      }
      throw new UnauthorizedError('Invalid token');
    }
  },

  /**
   * Extract token from Authorization header
   * @param {String} authHeader - Authorization header value
   * @returns {String|null} Token or null if not found
   */
  extractTokenFromHeader: (authHeader) => {
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return null;
    }
    return authHeader.split(' ')[1];
  },
  
  /**
   * Get token expiration time in seconds
   * @param {String} token - JWT token
   * @returns {Number} Seconds until token expires
   */
  getTokenExpirationTime: (token) => {
    const decoded = jwt.decode(token);
    if (!decoded || !decoded.exp) {
      return 0;
    }
    
    // exp is in seconds, current time is in milliseconds
    const expiresIn = decoded.exp - Math.floor(Date.now() / 1000);
    return expiresIn > 0 ? expiresIn : 0;
  },
  
  /**
   * Check if a token is about to expire (within the next 5 minutes)
   * @param {String} token - JWT token
   * @returns {Boolean} True if token is about to expire
   */
  isTokenAboutToExpire: (token) => {
    const expiresIn = jwtUtils.getTokenExpirationTime(token);
    // Return true if token expires in less than 5 minutes (300 seconds)
    return expiresIn < 300 && expiresIn > 0;
  }
};

module.exports = jwtUtils;