const { Barang, Kategori, Sequelize } = require('../models');
const logger = require('../utils/logger');
const { ValidationError, NotFoundError } = require('../utils/errors');
const { getPagination, getPagingData } = require('../utils/pagination');
const { Op } = Sequelize;

/**
 * Controller for managing barang (inventory items)
 */
const barangController = {
  /**
   * Get all items with pagination and filtering
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
        kategori_id, 
        kondisi, 
        tersedia,
        sort_by = 'kode',
        sort_order = 'asc'
      } = req.query;

      // Set up pagination
      const { limit, offset } = getPagination(page, per_page);

      // Set up where clause for filtering
      const whereClause = {};
      
      if (search) {
        whereClause[Op.or] = [
          { kode: { [Op.like]: `%${search}%` } },
          { nama: { [Op.like]: `%${search}%` } },
          { deskripsi: { [Op.like]: `%${search}%` } }
        ];
      }

      if (kategori_id) {
        whereClause.kategori_id = kategori_id;
      }

      if (kondisi) {
        whereClause.kondisi = kondisi;
      }

      if (tersedia === 'true') {
        whereClause.jumlah_tersedia = {
          [Op.gt]: 0
        };
      }

      // Set up sorting
      const order = [[sort_by, sort_order.toUpperCase()]];

      // Find all items with the specified filters
      const result = await Barang.findAndCountAll({
        where: whereClause,
        include: [
          {
            model: Kategori,
            as: 'kategori',
            attributes: ['id', 'nama']
          }
        ],
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
   * Get a single item by ID
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next middleware function
   */
  getById: async (req, res, next) => {
    try {
      const { id } = req.params;

      const barang = await Barang.findByPk(id, {
        include: [
          {
            model: Kategori,
            as: 'kategori',
            attributes: ['id', 'nama']
          }
        ]
      });

      if (!barang) {
        throw new NotFoundError('Barang tidak ditemukan');
      }

      res.json({
        data: barang
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Create a new item
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next middleware function
   */
  create: async (req, res, next) => {
    try {
      const { 
        kode, 
        nama, 
        deskripsi, 
        kategori_id, 
        jumlah, 
        kondisi, 
        lokasi, 
        tahun_pengadaan 
      } = req.body;

      // Validate required fields
      if (!kode || !nama || !kategori_id || !jumlah || !kondisi) {
        throw new ValidationError('Kode, nama, kategori, jumlah, dan kondisi harus diisi');
      }

      // Check if kategori exists
      const kategori = await Kategori.findByPk(kategori_id);
      if (!kategori) {
        throw new ValidationError('Kategori tidak ditemukan');
      }

      // Check if kode already exists
      const existingBarang = await Barang.findOne({ where: { kode } });
      if (existingBarang) {
        throw new ValidationError('Kode barang sudah digunakan');
      }

      // Create new barang
      const barang = await Barang.create({
        kode,
        nama,
        deskripsi,
        kategori_id,
        jumlah,
        jumlah_tersedia: jumlah, // Initially, all items are available
        kondisi,
        lokasi,
        tahun_pengadaan
      });

      // Fetch the created barang with its kategori
      const createdBarang = await Barang.findByPk(barang.id, {
        include: [
          {
            model: Kategori,
            as: 'kategori',
            attributes: ['id', 'nama']
          }
        ]
      });

      res.status(201).json({
        message: 'Barang berhasil ditambahkan',
        data: createdBarang
      });

      logger.info(`Barang created: ${nama} (ID: ${barang.id}) by user ID: ${req.user.id}`);
    } catch (error) {
      next(error);
    }
  },

  /**
   * Update an existing item
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next middleware function
   */
  update: async (req, res, next) => {
    try {
      const { id } = req.params;
      const { 
        kode, 
        nama, 
        deskripsi, 
        kategori_id, 
        jumlah, 
        kondisi, 
        lokasi, 
        tahun_pengadaan 
      } = req.body;

      // Find the item to update
      const barang = await Barang.findByPk(id);
      
      if (!barang) {
        throw new NotFoundError('Barang tidak ditemukan');
      }

      // Check if new kode already exists (if changed)
      if (kode && kode !== barang.kode) {
        const existingBarang = await Barang.findOne({ where: { kode } });
        if (existingBarang) {
          throw new ValidationError('Kode barang sudah digunakan');
        }
      }

      // Check if kategori exists (if changed)
      if (kategori_id && kategori_id !== barang.kategori_id) {
        const kategori = await Kategori.findByPk(kategori_id);
        if (!kategori) {
          throw new ValidationError('Kategori tidak ditemukan');
        }
      }

      // Calculate new jumlah_tersedia if jumlah is updated
      let jumlah_tersedia = barang.jumlah_tersedia;
      if (jumlah !== undefined) {
        // Calculate items being used
        const itemsInUse = barang.jumlah - barang.jumlah_tersedia;
        
        // Check if new jumlah is valid (can't be less than items currently in use)
        if (jumlah < itemsInUse) {
          throw new ValidationError(
            `Tidak dapat mengurangi jumlah barang di bawah ${itemsInUse} karena sedang dipinjam`
          );
        }
        
        // Update jumlah_tersedia based on the new jumlah
        jumlah_tersedia = jumlah - itemsInUse;
      }

      // Update the item
      await barang.update({
        kode: kode || barang.kode,
        nama: nama || barang.nama,
        deskripsi: deskripsi !== undefined ? deskripsi : barang.deskripsi,
        kategori_id: kategori_id || barang.kategori_id,
        jumlah: jumlah || barang.jumlah,
        jumlah_tersedia: jumlah_tersedia,
        kondisi: kondisi || barang.kondisi,
        lokasi: lokasi !== undefined ? lokasi : barang.lokasi,
        tahun_pengadaan: tahun_pengadaan !== undefined ? tahun_pengadaan : barang.tahun_pengadaan
      });

      // Fetch the updated barang with its kategori
      const updatedBarang = await Barang.findByPk(id, {
        include: [
          {
            model: Kategori,
            as: 'kategori',
            attributes: ['id', 'nama']
          }
        ]
      });

      res.json({
        message: 'Barang berhasil diperbarui',
        data: updatedBarang
      });

      logger.info(`Barang updated: ${updatedBarang.nama} (ID: ${id}) by user ID: ${req.user.id}`);
    } catch (error) {
      next(error);
    }
  },

  /**
   * Delete an item
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next middleware function
   */
  delete: async (req, res, next) => {
    try {
      const { id } = req.params;

      // Find the item to delete
      const barang = await Barang.findByPk(id);
      
      if (!barang) {
        throw new NotFoundError('Barang tidak ditemukan');
      }

      // Check if the item is being used (any current loans)
      if (barang.jumlah !== barang.jumlah_tersedia) {
        throw new ValidationError('Barang tidak dapat dihapus karena sedang dipinjam');
      }

      // Store info for logging
      const { nama, kode } = barang;

      // Delete the item
      await barang.destroy();

      res.json({
        message: 'Barang berhasil dihapus'
      });

      logger.info(`Barang deleted: ${nama} (${kode}) by user ID: ${req.user.id}`);
    } catch (error) {
      next(error);
    }
  },

  /**
   * Update item condition
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next middleware function
   */
  updateKondisi: async (req, res, next) => {
    try {
      const { id } = req.params;
      const { kondisi } = req.body;

      // Validate kondisi
      const validKondisi = ['baik', 'rusak_ringan', 'rusak_berat'];
      if (!kondisi || !validKondisi.includes(kondisi)) {
        throw new ValidationError('Kondisi tidak valid. Gunakan: baik, rusak_ringan, atau rusak_berat');
      }

      // Find the item
      const barang = await Barang.findByPk(id);
      
      if (!barang) {
        throw new NotFoundError('Barang tidak ditemukan');
      }

      // Update the item's condition
      await barang.update({ kondisi });

      res.json({
        message: 'Kondisi barang berhasil diperbarui',
        data: {
          id: barang.id,
          kode: barang.kode,
          nama: barang.nama,
          kondisi: barang.kondisi
        }
      });

      logger.info(`Barang condition updated: ${barang.nama} (ID: ${id}) to ${kondisi} by user ID: ${req.user.id}`);
    } catch (error) {
      next(error);
    }
  },

  /**
   * Import items from CSV/Excel (simplified version)
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next middleware function
   */
  importBarang: async (req, res, next) => {
    try {
      // In a real implementation, you would:
      // 1. Handle file upload
      // 2. Parse the file (CSV/Excel)
      // 3. Validate data
      // 4. Insert/update items in batch
      
      // This is a placeholder for the implementation
      res.status(501).json({
        message: 'Fitur import barang belum diimplementasikan'
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Export items to CSV/Excel (simplified version)
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next middleware function
   */
  exportBarang: async (req, res, next) => {
    try {
      // In a real implementation, you would:
      // 1. Fetch items based on filters
      // 2. Format data for export
      // 3. Generate CSV/Excel file
      // 4. Send file as response
      
      // This is a placeholder for the implementation
      res.status(501).json({
        message: 'Fitur export barang belum diimplementasikan'
      });
    } catch (error) {
      next(error);
    }
  }
};

module.exports = barangController;