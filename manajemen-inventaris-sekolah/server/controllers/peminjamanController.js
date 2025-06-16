const { Peminjaman, Barang, User, Sequelize } = require('../models');
const logger = require('../utils/logger');
const { ValidationError, NotFoundError, ForbiddenError } = require('../utils/errors');
const { getPagination, getPagingData } = require('../utils/pagination');
const { Op } = Sequelize;

/**
 * Controller for managing peminjaman (item loans)
 */
const peminjamanController = {
  /**
   * Get all loans with pagination and filtering
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next middleware function
   */
  getAll: async (req, res, next) => {
    try {
      const { 
        page, 
        per_page, 
        user_id, 
        barang_id, 
        status,
        terlambat,
        start_date,
        end_date,
        sort_by = 'created_at',
        sort_order = 'desc'
      } = req.query;

      // Set up pagination
      const { limit, offset } = getPagination(page, per_page);

      // Set up where clause for filtering
      const whereClause = {};
      
      if (user_id) {
        whereClause.user_id = user_id;
      }

      if (barang_id) {
        whereClause.barang_id = barang_id;
      }

      if (status) {
        whereClause.status = status;
      }

      // Filter by date range
      if (start_date || end_date) {
        whereClause.tanggal_pinjam = {};
        
        if (start_date) {
          whereClause.tanggal_pinjam[Op.gte] = new Date(start_date);
        }
        
        if (end_date) {
          const endDateObj = new Date(end_date);
          endDateObj.setDate(endDateObj.getDate() + 1); // Include the end date
          whereClause.tanggal_pinjam[Op.lt] = endDateObj;
        }
      }

      // Filter overdue items
      if (terlambat === 'true') {
        whereClause.status = 'dipinjam';
        whereClause.tanggal_kembali = {
          [Op.lt]: new Date()
        };
      }

      // Set up sorting
      const order = [[sort_by, sort_order.toUpperCase()]];

      // Find all loans with the specified filters
      const result = await Peminjaman.findAndCountAll({
        where: whereClause,
        include: [
          {
            model: Barang,
            as: 'barang',
            attributes: ['id', 'kode', 'nama', 'kondisi']
          },
          {
            model: User,
            as: 'user',
            attributes: ['id', 'name', 'email', 'role']
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
   * Get a single loan by ID
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next middleware function
   */
  getById: async (req, res, next) => {
    try {
      const { id } = req.params;

      const peminjaman = await Peminjaman.findByPk(id, {
        include: [
          {
            model: Barang,
            as: 'barang',
            attributes: ['id', 'kode', 'nama', 'kondisi', 'kategori_id']
          },
          {
            model: User,
            as: 'user',
            attributes: ['id', 'name', 'email', 'role']
          }
        ]
      });

      if (!peminjaman) {
        throw new NotFoundError('Peminjaman tidak ditemukan');
      }

      // Check authorization - users can only view their own loans unless they're admin/petugas
      if (req.user.role === 'user' && peminjaman.user_id !== req.user.id) {
        throw new ForbiddenError('Anda tidak memiliki akses ke data peminjaman ini');
      }

      res.json({
        data: peminjaman
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Create a new loan request
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next middleware function
   */
  create: async (req, res, next) => {
    try {
      const { 
        barang_id, 
        tanggal_pinjam, 
        tanggal_kembali, 
        jumlah = 1, 
        keperluan
      } = req.body;

      // Set user_id from authenticated user
      const user_id = req.user.id;

      // Validate required fields
      if (!barang_id || !tanggal_pinjam || !tanggal_kembali || !keperluan) {
        throw new ValidationError('Barang, tanggal pinjam, tanggal kembali, dan keperluan harus diisi');
      }

      // Check if dates are valid
      const today = new Date();
      const pinjamDate = new Date(tanggal_pinjam);
      const kembaliDate = new Date(tanggal_kembali);
      
      if (pinjamDate < today && req.user.role === 'user') {
        throw new ValidationError('Tanggal pinjam tidak boleh di masa lalu');
      }
      
      if (kembaliDate <= pinjamDate) {
        throw new ValidationError('Tanggal kembali harus setelah tanggal pinjam');
      }

      // Check if barang exists
      const barang = await Barang.findByPk(barang_id);
      if (!barang) {
        throw new ValidationError('Barang tidak ditemukan');
      }

      // Check if barang is available in requested quantity
      if (barang.jumlah_tersedia < jumlah) {
        throw new ValidationError(`Jumlah barang yang tersedia (${barang.jumlah_tersedia}) tidak mencukupi`);
      }

      // Create new peminjaman
      const peminjaman = await Peminjaman.create({
        user_id,
        barang_id,
        tanggal_pinjam,
        tanggal_kembali,
        jumlah,
        keperluan,
        status: 'menunggu',
        kondisi_saat_dipinjam: barang.kondisi
      });

      // Fetch the created peminjaman with its relations
      const createdPeminjaman = await Peminjaman.findByPk(peminjaman.id, {
        include: [
          {
            model: Barang,
            as: 'barang',
            attributes: ['id', 'kode', 'nama', 'kondisi']
          },
          {
            model: User,
            as: 'user',
            attributes: ['id', 'name', 'email', 'role']
          }
        ]
      });

      res.status(201).json({
        message: 'Permintaan peminjaman berhasil dibuat',
        data: createdPeminjaman
      });

      logger.info(`Peminjaman request created for barang: ${barang.nama} (ID: ${barang_id}) by user ID: ${user_id}`);
    } catch (error) {
      next(error);
    }
  },

  /**
   * Approve a loan request
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next middleware function
   */
  approve: async (req, res, next) => {
    try {
      const { id } = req.params;
      const { catatan_petugas } = req.body;

      // Only admin or petugas can approve
      if (req.user.role === 'user') {
        throw new ForbiddenError('Anda tidak memiliki hak untuk menyetujui peminjaman');
      }

      // Find the peminjaman
      const peminjaman = await Peminjaman.findByPk(id, {
        include: [
          {
            model: Barang,
            as: 'barang'
          }
        ]
      });
      
      if (!peminjaman) {
        throw new NotFoundError('Peminjaman tidak ditemukan');
      }

      // Check if peminjaman is in waiting status
      if (peminjaman.status !== 'menunggu') {
        throw new ValidationError(`Peminjaman tidak dapat disetujui karena status saat ini adalah ${peminjaman.status}`);
      }

      // Check if barang is still available
      const barang = await Barang.findByPk(peminjaman.barang_id);
      if (barang.jumlah_tersedia < peminjaman.jumlah) {
        throw new ValidationError(`Jumlah barang yang tersedia (${barang.jumlah_tersedia}) tidak mencukupi`);
      }

      // Update barang availability
      await barang.update({
        jumlah_tersedia: barang.jumlah_tersedia - peminjaman.jumlah
      });

      // Update peminjaman status
      await peminjaman.update({
        status: 'dipinjam',
        catatan_petugas,
        approved_by: req.user.id,
        approved_at: new Date()
      });

      // Fetch the updated peminjaman
      const updatedPeminjaman = await Peminjaman.findByPk(id, {
        include: [
          {
            model: Barang,
            as: 'barang',
            attributes: ['id', 'kode', 'nama', 'kondisi']
          },
          {
            model: User,
            as: 'user',
            attributes: ['id', 'name', 'email', 'role']
          }
        ]
      });

      res.json({
        message: 'Peminjaman berhasil disetujui',
        data: updatedPeminjaman
      });

      logger.info(`Peminjaman approved: ID ${id} by user ID: ${req.user.id}`);
    } catch (error) {
      next(error);
    }
  },

  /**
   * Reject a loan request
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next middleware function
   */
  reject: async (req, res, next) => {
    try {
      const { id } = req.params;
      const { alasan_penolakan } = req.body;

      // Validate request data
      if (!alasan_penolakan) {
        throw new ValidationError('Alasan penolakan harus diisi');
      }

      // Only admin or petugas can reject
      if (req.user.role === 'user') {
        throw new ForbiddenError('Anda tidak memiliki hak untuk menolak peminjaman');
      }

      // Find the peminjaman
      const peminjaman = await Peminjaman.findByPk(id);
      
      if (!peminjaman) {
        throw new NotFoundError('Peminjaman tidak ditemukan');
      }

      // Check if peminjaman is in waiting status
      if (peminjaman.status !== 'menunggu') {
        throw new ValidationError(`Peminjaman tidak dapat ditolak karena status saat ini adalah ${peminjaman.status}`);
      }

      // Update peminjaman status
      await peminjaman.update({
        status: 'ditolak',
        catatan_petugas: alasan_penolakan, // Gunakan field catatan_petugas yang sudah ada
        // Hapus atau komentari baris berikut:
        // rejected_by: req.user.id,
        // rejected_at: new Date()
      });

      // Fetch the updated peminjaman
      const updatedPeminjaman = await Peminjaman.findByPk(id, {
        include: [
          {
            model: Barang,
            as: 'barang',
            attributes: ['id', 'kode', 'nama', 'kondisi']
          },
          {
            model: User,
            as: 'user',
            attributes: ['id', 'name', 'email', 'role']
          }
        ]
      });

      res.json({
        message: 'Peminjaman berhasil ditolak',
        data: updatedPeminjaman
      });

      logger.info(`Peminjaman rejected: ID ${id} by user ID: ${req.user.id}`);
    } catch (error) {
      next(error);
    }
  },

  /**
   * Process item return
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next middleware function
   */
  processReturn: async (req, res, next) => {
    try {
      const { id } = req.params;
      const { 
        kondisi_saat_kembali, 
        catatan_pengembalian 
      } = req.body;

      // Validate request data
      if (!kondisi_saat_kembali) {
        throw new ValidationError('Kondisi saat kembali harus diisi');
      }

      // Only admin or petugas can process returns
      if (req.user.role === 'user') {
        throw new ForbiddenError('Anda tidak memiliki hak untuk memproses pengembalian');
      }

      // Find the peminjaman
      const peminjaman = await Peminjaman.findByPk(id, {
        include: [
          {
            model: Barang,
            as: 'barang'
          }
        ]
      });
      
      if (!peminjaman) {
        throw new NotFoundError('Peminjaman tidak ditemukan');
      }

      // Check if peminjaman is in borrowed status
      if (peminjaman.status !== 'dipinjam') {
        throw new ValidationError(`Peminjaman tidak dapat dikembalikan karena status saat ini adalah ${peminjaman.status}`);
      }

      // Get the barang
      const barang = await Barang.findByPk(peminjaman.barang_id);

      // Update barang availability
      await barang.update({
        jumlah_tersedia: barang.jumlah_tersedia + peminjaman.jumlah
      });

      // Update barang condition if it's worse than before
      const kondisiRanking = {
        'baik': 3,
        'rusak_ringan': 2,
        'rusak_berat': 1
      };

      if (kondisiRanking[kondisi_saat_kembali] < kondisiRanking[barang.kondisi]) {
        await barang.update({
          kondisi: kondisi_saat_kembali
        });
      }

      // Update peminjaman status
      await peminjaman.update({
        status: 'dikembalikan',
        kondisi_saat_kembali,
        catatan_petugas: catatan_pengembalian, // Gunakan field catatan_petugas untuk catatan pengembalian
        tanggal_dikembalikan: new Date(),
        // Hapus atau komentari baris berikut:
        // processed_by: req.user.id
      });

      // Fetch the updated peminjaman
      const updatedPeminjaman = await Peminjaman.findByPk(id, {
        include: [
          {
            model: Barang,
            as: 'barang',
            attributes: ['id', 'kode', 'nama', 'kondisi']
          },
          {
            model: User,
            as: 'user',
            attributes: ['id', 'name', 'email', 'role']
          }
        ]
      });

      res.json({
        message: 'Pengembalian berhasil diproses',
        data: updatedPeminjaman
      });

      logger.info(`Peminjaman returned: ID ${id} by user ID: ${req.user.id}`);
    } catch (error) {
      next(error);
    }
  },

  /**
   * Cancel a loan request (by user)
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next middleware function
   */
  cancel: async (req, res, next) => {
    try {
      const { id } = req.params;

      // Find the peminjaman
      const peminjaman = await Peminjaman.findByPk(id);
      
      if (!peminjaman) {
        throw new NotFoundError('Peminjaman tidak ditemukan');
      }

      // Check if the user is the owner of the peminjaman or an admin/petugas
      if (req.user.role === 'user' && peminjaman.user_id !== req.user.id) {
        throw new ForbiddenError('Anda tidak memiliki hak untuk membatalkan peminjaman ini');
      }

      // Check if peminjaman is in waiting status
      if (peminjaman.status !== 'menunggu') {
        throw new ValidationError(`Peminjaman tidak dapat dibatalkan karena status saat ini adalah ${peminjaman.status}`);
      }

      // Update peminjaman status
      await peminjaman.update({
        status: 'dibatalkan',
        // Hapus atau komentari baris berikut:
        // canceled_by: req.user.id,
        // canceled_at: new Date()
      });

      res.json({
        message: 'Peminjaman berhasil dibatalkan'
      });

      logger.info(`Peminjaman canceled: ID ${id} by user ID: ${req.user.id}`);
    } catch (error) {
      next(error);
    }
  },

  /**
   * Get user loan statistics
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next middleware function
   */
  getUserStats: async (req, res, next) => {
    try {
      const userId = req.user.id;

      // Count total loans
      const totalDipinjam = await Peminjaman.count({
        where: {
          user_id: userId
        }
      });

      // Count current active loans
      const sedangDipinjam = await Peminjaman.count({
        where: {
          user_id: userId,
          status: 'dipinjam'
        }
      });

      // Count pending approval loans
      const menungguPersetujuan = await Peminjaman.count({
        where: {
          user_id: userId,
          status: 'menunggu'
        }
      });

      // Count returned loans
      const telahDikembalikan = await Peminjaman.count({
        where: {
          user_id: userId,
          status: 'dikembalikan'
        }
      });

      // Count overdue loans
      const terlambat = await Peminjaman.count({
        where: {
          user_id: userId,
          status: 'dipinjam',
          tanggal_kembali: {
            [Op.lt]: new Date()
          }
        }
      });

      res.json({
        data: {
          total_dipinjam: totalDipinjam,
          sedang_dipinjam: sedangDipinjam,
          menunggu_persetujuan: menungguPersetujuan,
          telah_dikembalikan: telahDikembalikan,
          terlambat: terlambat
        }
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Get overall loan statistics (for admin dashboard)
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next middleware function
   */
  getOverallStats: async (req, res, next) => {
    try {
      // Check if user is admin or petugas
      if (req.user.role === 'user') {
        throw new ForbiddenError('Anda tidak memiliki akses ke data statistik keseluruhan');
      }

      // Count total loans
      const totalPeminjaman = await Peminjaman.count();

      // Count loans by status
      const menunggu = await Peminjaman.count({
        where: { status: 'menunggu' }
      });

      const dipinjam = await Peminjaman.count({
        where: { status: 'dipinjam' }
      });

      const dikembalikan = await Peminjaman.count({
        where: { status: 'dikembalikan' }
      });

      const ditolak = await Peminjaman.count({
        where: { status: 'ditolak' }
      });

      const dibatalkan = await Peminjaman.count({
        where: { status: 'dibatalkan' }
      });

      // Count overdue loans
      const terlambat = await Peminjaman.count({
        where: {
          status: 'dipinjam',
          tanggal_kembali: {
            [Op.lt]: new Date()
          }
        }
      });

      // Get most borrowed items
      const popularItems = await Peminjaman.findAll({
        attributes: [
          'barang_id',
          [Sequelize.fn('COUNT', Sequelize.col('barang_id')), 'borrowCount']
        ],
        include: [
          {
            model: Barang,
            as: 'barang',
            attributes: ['kode', 'nama']
          }
        ],
        group: ['barang_id'],
        order: [[Sequelize.literal('borrowCount'), 'DESC']],
        limit: 5
      });

      res.json({
        data: {
          total_peminjaman: totalPeminjaman,
          menunggu,
          dipinjam,
          dikembalikan,
          ditolak,
          dibatalkan,
          terlambat,
          popular_items: popularItems
        }
      });
    } catch (error) {
      next(error);
    }
  }
};

module.exports = peminjamanController;