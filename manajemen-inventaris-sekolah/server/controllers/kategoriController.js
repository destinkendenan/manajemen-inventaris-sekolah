const { Kategori, Barang, Sequelize } = require('../models');
const logger = require('../utils/logger');
const { ValidationError, NotFoundError } = require('../utils/errors');
const { getPagination, getPagingData } = require('../utils/pagination');
const { Op } = Sequelize;

/**
 * Controller for managing kategori (inventory categories)
 */
const kategoriController = {
  /**
   * Get all categories with pagination and filtering
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next middleware function
   */
  getAll: async (req, res, next) => {
    try {
      const { 
        page, 
        per_page, 
        search,
        sort_by = 'nama',
        sort_order = 'asc'
      } = req.query;

      // Set up pagination
      const { limit, offset } = getPagination(page, per_page);

      // Set up where clause for filtering
      const whereClause = {};
      
      if (search) {
        whereClause[Op.or] = [
          { nama: { [Op.like]: `%${search}%` } },
          { deskripsi: { [Op.like]: `%${search}%` } }
        ];
      }

      // Set up sorting
      const order = [[sort_by, sort_order.toUpperCase()]];

      // Find all categories with the specified filters
      const result = await Kategori.findAndCountAll({
        where: whereClause,
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
   * Get a single category by ID
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next middleware function
   */
  getById: async (req, res, next) => {
    try {
      const { id } = req.params;

      const kategori = await Kategori.findByPk(id);

      if (!kategori) {
        throw new NotFoundError('Kategori tidak ditemukan');
      }

      res.json({
        data: kategori
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Create a new category
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next middleware function
   */
  create: async (req, res, next) => {
    try {
      const { nama, deskripsi } = req.body;

      // Validate required fields
      if (!nama) {
        throw new ValidationError('Nama kategori harus diisi');
      }

      // Check if name already exists
      const existingKategori = await Kategori.findOne({ 
        where: { 
          nama: { [Op.eq]: nama } 
        } 
      });
      
      if (existingKategori) {
        throw new ValidationError('Nama kategori sudah digunakan');
      }

      // Create new kategori
      const kategori = await Kategori.create({
        nama,
        deskripsi
      });

      res.status(201).json({
        message: 'Kategori berhasil ditambahkan',
        data: kategori
      });

      logger.info(`Kategori created: ${nama} (ID: ${kategori.id}) by user ID: ${req.user.id}`);
    } catch (error) {
      next(error);
    }
  },

  /**
   * Update an existing category
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next middleware function
   */
  update: async (req, res, next) => {
    try {
      const { id } = req.params;
      const { nama, deskripsi } = req.body;

      // Find the category to update
      const kategori = await Kategori.findByPk(id);
      
      if (!kategori) {
        throw new NotFoundError('Kategori tidak ditemukan');
      }

      // Check if new name already exists (if changed)
      if (nama && nama !== kategori.nama) {
        const existingKategori = await Kategori.findOne({ 
          where: { 
            nama: { [Op.eq]: nama } 
          } 
        });
        
        if (existingKategori) {
          throw new ValidationError('Nama kategori sudah digunakan');
        }
      }

      // Update the category
      await kategori.update({
        nama: nama || kategori.nama,
        deskripsi: deskripsi !== undefined ? deskripsi : kategori.deskripsi
      });

      res.json({
        message: 'Kategori berhasil diperbarui',
        data: kategori
      });

      logger.info(`Kategori updated: ${kategori.nama} (ID: ${id}) by user ID: ${req.user.id}`);
    } catch (error) {
      next(error);
    }
  },

  /**
   * Delete a category
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next middleware function
   */
  delete: async (req, res, next) => {
    try {
      const { id } = req.params;

      // Find the category to delete
      const kategori = await Kategori.findByPk(id);
      
      if (!kategori) {
        throw new NotFoundError('Kategori tidak ditemukan');
      }

      // Check if the category is being used by any items
      const itemsCount = await Barang.count({ where: { kategori_id: id } });
      
      if (itemsCount > 0) {
        throw new ValidationError(
          `Kategori tidak dapat dihapus karena masih digunakan oleh ${itemsCount} barang`
        );
      }

      // Store info for logging
      const { nama } = kategori;

      // Delete the category
      await kategori.destroy();

      res.json({
        message: 'Kategori berhasil dihapus'
      });

      logger.info(`Kategori deleted: ${nama} (ID: ${id}) by user ID: ${req.user.id}`);
    } catch (error) {
      next(error);
    }
  },

  /**
   * Get items count by categories (for statistics)
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next middleware function
   */
  getItemsCount: async (req, res, next) => {
    try {
      // Find all categories with their item counts
      const kategoris = await Kategori.findAll({
        attributes: [
          'id',
          'nama',
          [Sequelize.fn('COUNT', Sequelize.col('barangs.id')), 'itemCount']
        ],
        include: [{
          model: Barang,
          as: 'barangs',
          attributes: []
        }],
        group: ['Kategori.id'],
        raw: true
      });

      res.json({
        data: kategoris
      });
    } catch (error) {
      next(error);
    }
  }
};

module.exports = kategoriController;