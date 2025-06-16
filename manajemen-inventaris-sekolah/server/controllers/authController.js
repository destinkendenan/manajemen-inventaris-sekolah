const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { User } = require('../models');
const config = require('../config/config');
const { ValidationError } = require('../utils/errors');
const logger = require('../utils/logger');

/**
 * Authentication controller
 */
const authController = {
  /**
   * Register a new user
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next middleware function
   */
  register: async (req, res, next) => {
    try {
      const { name, email, password, password_confirmation } = req.body;
      
      // Validate request data
      if (!name || !email || !password) {
        throw new ValidationError('Nama, email dan password harus diisi');
      }
      
      if (password !== password_confirmation) {
        throw new ValidationError('Konfirmasi password tidak cocok');
      }
      
      // Check if email already exists
      const existingUser = await User.findOne({ where: { email } });
      if (existingUser) {
        throw new ValidationError('Email sudah terdaftar');
      }
      
      // Create user with default role 'user'
      const user = await User.create({
        name,
        email,
        password: password, // password plain, akan di-hash oleh hook
        role: 'user', // User baru selalu role 'user'
        status: 'active'
      });
      
      // Generate token
      const token = jwt.sign(
        { id: user.id, email: user.email, role: user.role },
        config.jwt.secret || 'your-secret-key', // Berikan fallback jika belum ada config
        { expiresIn: config.jwt.expiresIn || '24h' }
      );
      
      // Omit password from response
      const userData = user.toJSON();
      delete userData.password;
      
      res.status(201).json({
        message: 'Registrasi berhasil',
        user: userData,
        token
      });
      
      logger.info(`User registered: ${email} (ID: ${user.id})`);
    } catch (error) {
      next(error);
    }
  },
  
  /**
   * User login
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next middleware function
   */
  login: async (req, res, next) => {
    try {
      const { email, password } = req.body;
      
      console.log('Mencoba login dengan email:', email);
      
      // Find user by email
      const user = await User.scope('withPassword').findOne({ where: { email } });
      console.log('User ditemukan:', !!user);
      
      if (!user) {
        throw new ValidationError('Email atau password salah');
      }
      
      // Check if password matches
      const isPasswordValid = await bcrypt.compare(password, user.password);
      console.log('Password valid:', isPasswordValid);
      console.log('Status user:', user.status);
      console.log('Password dari DB:', user.password);
      
      if (!isPasswordValid) {
        throw new ValidationError('Email atau password salah');
      }
      
      // Check if user is active
      if (user.status !== 'active') {
        throw new ValidationError('Akun Anda tidak aktif. Silakan hubungi administrator.');
      }
      
      // Generate token
      const token = jwt.sign(
        { id: user.id, email: user.email, role: user.role },
        config.jwt.secret || 'your-secret-key',
        { expiresIn: config.jwt.expiresIn || '24h' }
      );
      
      // Update last login timestamp
      await user.update({ last_login: new Date() });
      
      // Omit password from response
      const userData = user.toJSON();
      delete userData.password;
      
      res.json({
        message: 'Login berhasil',
        user: userData,
        token
      });
      
      logger.info(`User logged in: ${email} (ID: ${user.id})`);
    } catch (error) {
      next(error);
    }
  },
  
  /**
   * Get current user data
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next middleware function
   */
  me: async (req, res, next) => {
    try {
      // User is already attached to request by auth middleware
      const { id } = req.user;
      
      const user = await User.findByPk(id, {
        attributes: { exclude: ['password'] }
      });
      
      if (!user) {
        return res.status(404).json({
          message: 'User tidak ditemukan'
        });
      }
      
      res.json({
        user
      });
    } catch (error) {
      next(error);
    }
  },
  
  /**
   * Refresh token
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next middleware function
   */
  refreshToken: async (req, res, next) => {
    try {
      const { refreshToken } = req.body;
      
      if (!refreshToken) {
        throw new ValidationError('Refresh token diperlukan');
      }
      
      // Verify refresh token
      let decoded;
      try {
        decoded = jwt.verify(refreshToken, config.jwt.secret);
      } catch (err) {
        throw new ValidationError('Refresh token tidak valid atau kedaluwarsa');
      }
      
      // Get user
      const user = await User.findByPk(decoded.id);
      if (!user) {
        throw new ValidationError('User tidak ditemukan');
      }
      
      // Check if user is active
      if (user.status !== 'active') {
        throw new ValidationError('Akun Anda tidak aktif. Hubungi administrator');
      }
      
      // Generate new token
      const token = jwt.sign(
        { id: user.id, email: user.email, role: user.role },
        config.jwt.secret,
        { expiresIn: config.jwt.expiresIn }
      );
      
      // Generate new refresh token
      const newRefreshToken = jwt.sign(
        { id: user.id },
        config.jwt.secret,
        { expiresIn: config.jwt.refreshExpiresIn }
      );
      
      res.json({
        message: 'Token berhasil diperbarui',
        token,
        refreshToken: newRefreshToken
      });
    } catch (error) {
      next(error);
    }
  },
  
  /**
   * Change password
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next middleware function
   */
  changePassword: async (req, res, next) => {
    try {
      const { current_password, new_password, password_confirmation } = req.body;
      const userId = req.user.id;
      
      // Validate request data
      if (!current_password || !new_password || !password_confirmation) {
        throw new ValidationError('Semua field harus diisi');
      }
      
      if (new_password !== password_confirmation) {
        throw new ValidationError('Konfirmasi password baru tidak cocok');
      }
      
      // Find user
      const user = await User.findByPk(userId);
      if (!user) {
        throw new ValidationError('User tidak ditemukan');
      }
      
      // Verify current password
      const isPasswordValid = await bcrypt.compare(current_password, user.password);
      if (!isPasswordValid) {
        throw new ValidationError('Password saat ini salah');
      }
      
      // Hash new password
      const hashedPassword = await bcrypt.hash(new_password, config.bcrypt.saltRounds);
      
      // Update password
      await user.update({ password: hashedPassword });
      
      res.json({
        message: 'Password berhasil diubah'
      });
      
      logger.info(`User changed password: ${user.email} (ID: ${user.id})`);
    } catch (error) {
      next(error);
    }
  },
  
  /**
   * Forgot password - send reset link
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next middleware function
   */
  forgotPassword: async (req, res, next) => {
    try {
      const { email } = req.body;
      
      if (!email) {
        throw new ValidationError('Email harus diisi');
      }
      
      // Find user by email
      const user = await User.findOne({ where: { email } });
      
      // Don't reveal if user exists or not
      if (!user) {
        return res.json({
          message: 'Jika email terdaftar, instruksi reset password akan dikirim'
        });
      }
      
      // Generate reset token
      const resetToken = jwt.sign(
        { id: user.id, purpose: 'password_reset' },
        config.jwt.secret,
        { expiresIn: '1h' }
      );
      
      // Save reset token to user (in a real app, you might save it to DB)
      // For this example, we'll just generate the reset URL
      const resetUrl = `${config.app.url}/reset-password?token=${resetToken}`;
      
      // In a real application, you would send an email with the reset link
      // For this example, we'll just log it
      logger.info(`Password reset requested for ${email}. Reset URL: ${resetUrl}`);
      
      res.json({
        message: 'Jika email terdaftar, instruksi reset password akan dikirim',
        // Only for development/demo purposes, remove in production
        resetUrl: process.env.NODE_ENV === 'development' ? resetUrl : undefined
      });
    } catch (error) {
      next(error);
    }
  },
  
  /**
   * Reset password with token
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next middleware function
   */
  resetPassword: async (req, res, next) => {
    try {
      const { token, password, password_confirmation } = req.body;
      
      if (!token || !password || !password_confirmation) {
        throw new ValidationError('Semua field harus diisi');
      }
      
      if (password !== password_confirmation) {
        throw new ValidationError('Konfirmasi password tidak cocok');
      }
      
      // Verify token
      let decoded;
      try {
        decoded = jwt.verify(token, config.jwt.secret);
      } catch (err) {
        throw new ValidationError('Token tidak valid atau kedaluwarsa');
      }
      
      // Check token purpose
      if (decoded.purpose !== 'password_reset') {
        throw new ValidationError('Token tidak valid');
      }
      
      // Find user
      const user = await User.findByPk(decoded.id);
      if (!user) {
        throw new ValidationError('User tidak ditemukan');
      }
      
      // Hash new password
      const hashedPassword = await bcrypt.hash(password, config.bcrypt.saltRounds);
      
      // Update password
      await user.update({ password: hashedPassword });
      
      res.json({
        message: 'Password berhasil direset'
      });
      
      logger.info(`Password reset successful for user: ${user.email} (ID: ${user.id})`);
    } catch (error) {
      next(error);
    }
  },
  
  /**
   * Logout (client-side only, just for API consistency)
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  logout: (req, res) => {
    // JWT is stateless, so we don't need to do anything server-side
    // The client should delete the token
    res.json({
      message: 'Logout berhasil'
    });
  }
};

module.exports = authController;