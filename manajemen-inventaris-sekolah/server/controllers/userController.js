const bcrypt = require('bcrypt');
const { User, Peminjaman, Sequelize } = require('../models');
const logger = require('../utils/logger');
const { ValidationError, NotFoundError, ForbiddenError } = require('../utils/errors');
const { getPagination, getPagingData } = require('../utils/pagination');
const config = require('../config/config');
const { Op } = Sequelize;

/**
 * Controller for managing users
 */
const userController = {
  /**
   * Get all users with pagination and filtering
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next middleware function
   */
  getAll: async (req, res, next) => {
    try {
      // Check authorization - only admin can view all users
      if (req.user.role !== 'admin' && req.user.role !== 'petugas') {
        throw new ForbiddenError('Anda tidak memiliki akses untuk melihat daftar pengguna');
      }

      const { 
        page, 
        per_page, 
        search, 
        role,
        status,
        sort_by = 'name',
        sort_order = 'asc'
      } = req.query;

      // Set up pagination
      const { limit, offset } = getPagination(page, per_page);

      // Set up where clause for filtering
      const whereClause = {};
      
      if (search) {
        whereClause[Op.or] = [
          { name: { [Op.like]: `%${search}%` } },
          { email: { [Op.like]: `%${search}%` } }
        ];
      }

      if (role) {
        whereClause.role = role;
      }

      if (status) {
        whereClause.status = status;
      }

      // Set up sorting
      const order = [[sort_by, sort_order.toUpperCase()]];

      // Find all users with the specified filters
      const result = await User.findAndCountAll({
        where: whereClause,
        attributes: { exclude: ['password'] }, // Don't return passwords
        limit,
        offset,
        order,
        distinct: true
      });

      // Format pagination data
      const response = getPagingData(result, page, limit);

      res.json(response);
    } catch (error) {
      next(error);
    }
  },

  /**
   * Get a single user by ID
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next middleware function
   */
  getById: async (req, res, next) => {
    try {
      const { id } = req.params;

      // Check authorization - users can only view their own profile unless they're admin/petugas
      if (req.user.role === 'user' && req.user.id !== parseInt(id)) {
        throw new ForbiddenError('Anda tidak memiliki akses untuk melihat profil pengguna lain');
      }

      const user = await User.findByPk(id, {
        attributes: { exclude: ['password'] }
      });

      if (!user) {
        throw new NotFoundError('Pengguna tidak ditemukan');
      }

      res.json({
        data: user
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Create a new user (admin only)
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next middleware function
   */
  create: async (req, res, next) => {
    try {
      // Check authorization - only admin can create users
      if (req.user.role !== 'admin') {
        throw new ForbiddenError('Anda tidak memiliki akses untuk membuat pengguna baru');
      }

      const { name, email, password, role, status = 'active' } = req.body;
      
      // Validate required fields
      if (!name || !email || !password) {
        throw new ValidationError('Nama, email, dan password harus diisi');
      }

      // Validate role
      const validRoles = ['admin', 'petugas', 'user'];
      if (role && !validRoles.includes(role)) {
        throw new ValidationError('Role tidak valid. Gunakan: admin, petugas, atau user');
      }

      // Validate status
      const validStatuses = ['active', 'inactive'];
      if (status && !validStatuses.includes(status)) {
        throw new ValidationError('Status tidak valid. Gunakan: active atau inactive');
      }

      // Check if email already exists
      const existingUser = await User.findOne({ where: { email } });
      if (existingUser) {
        throw new ValidationError('Email sudah terdaftar');
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, config.bcrypt.saltRounds);

      // Create new user
      const user = await User.create({
        name,
        email,
        password: hashedPassword,
        role: role || 'user',
        status
      });

      // Omit password from response
      const { password: _, ...userData } = user.toJSON();

      res.status(201).json({
        message: 'Pengguna berhasil ditambahkan',
        data: userData
      });

      logger.info(`User created: ${email} (ID: ${user.id}) by admin ID: ${req.user.id}`);
    } catch (error) {
      next(error);
    }
  },

  /**
   * Update a user
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next middleware function
   */
  update: async (req, res, next) => {
    try {
      const { id } = req.params;
      const { name, email } = req.body;

      // Check authorization - users can only update their own profile unless they're admin
      if (req.user.role === 'user' && req.user.id !== parseInt(id)) {
        throw new ForbiddenError('Anda tidak memiliki akses untuk mengubah profil pengguna lain');
      }

      // Find the user to update
      const user = await User.findByPk(id);
      
      if (!user) {
        throw new NotFoundError('Pengguna tidak ditemukan');
      }

      // Check if new email already exists (if changed)
      if (email && email !== user.email) {
        const existingUser = await User.findOne({ where: { email } });
        if (existingUser) {
          throw new ValidationError('Email sudah digunakan oleh pengguna lain');
        }
      }

      // Update the user
      await user.update({
        name: name || user.name,
        email: email || user.email
      });

      // Omit password from response
      const { password: _, ...userData } = user.toJSON();

      res.json({
        message: 'Profil pengguna berhasil diperbarui',
        data: userData
      });

      logger.info(`User updated: ${user.email} (ID: ${id}) by user ID: ${req.user.id}`);
    } catch (error) {
      next(error);
    }
  },

  /**
   * Update user role (admin only)
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next middleware function
   */
  updateRole: async (req, res, next) => {
    try {
      // Check authorization - only admin can update user roles
      if (req.user.role !== 'admin') {
        throw new ForbiddenError('Anda tidak memiliki akses untuk mengubah role pengguna');
      }

      const { id } = req.params;
      const { role } = req.body;

      // Validate role
      const validRoles = ['admin', 'petugas', 'user'];
      if (!role || !validRoles.includes(role)) {
        throw new ValidationError('Role tidak valid. Gunakan: admin, petugas, atau user');
      }

      // Find the user to update
      const user = await User.findByPk(id);
      
      if (!user) {
        throw new NotFoundError('Pengguna tidak ditemukan');
      }

      // Prevent changing the role of the last admin
      if (user.role === 'admin' && role !== 'admin') {
        const adminCount = await User.count({ where: { role: 'admin' } });
        if (adminCount <= 1) {
          throw new ValidationError('Tidak dapat mengubah role admin terakhir');
        }
      }

      // Update the user's role
      await user.update({ role });

      // Omit password from response
      const { password: _, ...userData } = user.toJSON();

      res.json({
        message: 'Role pengguna berhasil diperbarui',
        data: userData
      });

      logger.info(`User role updated: ${user.email} (ID: ${id}) to ${role} by admin ID: ${req.user.id}`);
    } catch (error) {
      next(error);
    }
  },

  /**
   * Update user status (admin only)
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next middleware function
   */
  updateStatus: async (req, res, next) => {
    try {
      // Check authorization - only admin can update user status
      if (req.user.role !== 'admin') {
        throw new ForbiddenError('Anda tidak memiliki akses untuk mengubah status pengguna');
      }

      const { id } = req.params;
      const { status } = req.body;

      // Validate status
      const validStatuses = ['active', 'inactive'];
      if (!status || !validStatuses.includes(status)) {
        throw new ValidationError('Status tidak valid. Gunakan: active atau inactive');
      }

      // Find the user to update
      const user = await User.findByPk(id);
      
      if (!user) {
        throw new NotFoundError('Pengguna tidak ditemukan');
      }

      // Prevent deactivating own account
      if (parseInt(id) === req.user.id && status === 'inactive') {
        throw new ValidationError('Anda tidak dapat menonaktifkan akun Anda sendiri');
      }

      // Prevent deactivating the last admin
      if (user.role === 'admin' && status === 'inactive') {
        const activeAdminCount = await User.count({ 
          where: { 
            role: 'admin',
            status: 'active'
          } 
        });
        
        if (activeAdminCount <= 1) {
          throw new ValidationError('Tidak dapat menonaktifkan admin terakhir');
        }
      }

      // Update the user's status
      await user.update({ status });

      // Omit password from response
      const { password: _, ...userData } = user.toJSON();

      res.json({
        message: 'Status pengguna berhasil diperbarui',
        data: userData
      });

      logger.info(`User status updated: ${user.email} (ID: ${id}) to ${status} by admin ID: ${req.user.id}`);
    } catch (error) {
      next(error);
    }
  },

  /**
   * Reset user password (admin only)
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next middleware function
   */
  resetPassword: async (req, res, next) => {
    try {
      // Check authorization - only admin can reset passwords
      if (req.user.role !== 'admin') {
        throw new ForbiddenError('Anda tidak memiliki akses untuk mereset password pengguna');
      }

      const { id } = req.params;
      const { new_password } = req.body;

      // Validate new password
      if (!new_password || new_password.length < 6) {
        throw new ValidationError('Password baru harus memiliki minimal 6 karakter');
      }

      // Find the user
      const user = await User.findByPk(id);
      
      if (!user) {
        throw new NotFoundError('Pengguna tidak ditemukan');
      }

      // Hash new password
      const hashedPassword = await bcrypt.hash(new_password, config.bcrypt.saltRounds);

      // Update the user's password
      await user.update({ password: hashedPassword });

      res.json({
        message: 'Password pengguna berhasil direset'
      });

      logger.info(`User password reset: ${user.email} (ID: ${id}) by admin ID: ${req.user.id}`);
    } catch (error) {
      next(error);
    }
  },

  /**
   * Delete a user (admin only)
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next middleware function
   */
  delete: async (req, res, next) => {
    try {
      // Check authorization - only admin can delete users
      if (req.user.role !== 'admin') {
        throw new ForbiddenError('Anda tidak memiliki akses untuk menghapus pengguna');
      }

      const { id } = req.params;

      // Prevent deleting own account
      if (parseInt(id) === req.user.id) {
        throw new ValidationError('Anda tidak dapat menghapus akun Anda sendiri');
      }

      // Find the user to delete
      const user = await User.findByPk(id);
      
      if (!user) {
        throw new NotFoundError('Pengguna tidak ditemukan');
      }

      // Prevent deleting the last admin
      if (user.role === 'admin') {
        const adminCount = await User.count({ where: { role: 'admin' } });
        if (adminCount <= 1) {
          throw new ValidationError('Tidak dapat menghapus admin terakhir');
        }
      }

      // Check if user has active loans
      const activeLoans = await Peminjaman.count({
        where: {
          user_id: id,
          status: 'dipinjam'
        }
      });

      if (activeLoans > 0) {
        throw new ValidationError('Pengguna tidak dapat dihapus karena masih memiliki peminjaman aktif');
      }

      // Store info for logging
      const { email, name } = user;

      // Delete the user
      await user.destroy();

      res.json({
        message: 'Pengguna berhasil dihapus'
      });

      logger.info(`User deleted: ${email} (${name}) by admin ID: ${req.user.id}`);
    } catch (error) {
      next(error);
    }
  },

  /**
   * Get user's loan history
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next middleware function
   */
  getLoanHistory: async (req, res, next) => {
    try {
      const { id } = req.params;
      
      // Check authorization - users can only view their own history unless they're admin/petugas
      if (req.user.role === 'user' && req.user.id !== parseInt(id)) {
        throw new ForbiddenError('Anda tidak memiliki akses untuk melihat riwayat peminjaman pengguna lain');
      }

      // Check if user exists
      const user = await User.findByPk(id, {
        attributes: ['id', 'name', 'email']
      });
      
      if (!user) {
        throw new NotFoundError('Pengguna tidak ditemukan');
      }

      // Get loan history
      const loans = await Peminjaman.findAll({
        where: { user_id: id },
        include: [
          {
            model: Barang,
            as: 'barang',
            attributes: ['id', 'kode', 'nama', 'kondisi']
          }
        ],
        order: [['created_at', 'DESC']]
      });

      res.json({
        data: {
          user,
          loans
        }
      });
    } catch (error) {
      next(error);
    }
  }
};

module.exports = userController;