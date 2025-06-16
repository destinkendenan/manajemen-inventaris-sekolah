const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Peminjaman extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // Relasi ke User (peminjam)
      Peminjaman.belongsTo(models.User, {
        foreignKey: 'user_id',
        as: 'user'
      });
      
      // Relasi ke Barang
      Peminjaman.belongsTo(models.Barang, {
        foreignKey: 'barang_id',
        as: 'barang'
      });
      
      // Relasi ke User (yang menyetujui)
      Peminjaman.belongsTo(models.User, {
        foreignKey: 'approved_by',
        as: 'approver'
      });
    }
  }
  
  Peminjaman.init({
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      }
    },
    barang_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'barang',
        key: 'id'
      }
    },
    tanggal_pinjam: {
      type: DataTypes.DATE,
      allowNull: false
    },
    tanggal_kembali: {
      type: DataTypes.DATE,
      allowNull: false
    },
    tanggal_dikembalikan: {
      type: DataTypes.DATE,
      allowNull: true
    },
    jumlah: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1
    },
    keperluan: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    status: {
      type: DataTypes.ENUM('menunggu', 'dipinjam', 'dikembalikan', 'ditolak', 'dibatalkan'),
      allowNull: false,
      defaultValue: 'menunggu'
    },
    catatan_petugas: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    kondisi_saat_dipinjam: {
      type: DataTypes.ENUM('baik', 'rusak_ringan', 'rusak_berat'),
      allowNull: true
    },
    kondisi_saat_kembali: {
      type: DataTypes.ENUM('baik', 'rusak_ringan', 'rusak_berat'),
      allowNull: true
    },
    approved_by: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'users',
        key: 'id'
      }
    },
    approved_at: {
      type: DataTypes.DATE,
      allowNull: true
    }
  }, {
    sequelize,
    modelName: 'Peminjaman',
    tableName: 'peminjaman',
    underscored: true,
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  });
  
  return Peminjaman;
};
