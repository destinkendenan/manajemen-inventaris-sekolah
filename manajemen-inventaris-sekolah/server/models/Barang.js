const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Barang extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // Define association here
      Barang.belongsTo(models.Kategori, {
        foreignKey: 'kategori_id',
        as: 'kategori'
      });
      
      Barang.hasMany(models.Peminjaman, {
        foreignKey: 'barang_id',
        as: 'peminjaman'
      });
    }
  }
  
  Barang.init({
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    kode: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: {
        msg: 'Kode barang sudah digunakan'
      },
      validate: {
        notNull: {
          msg: 'Kode barang harus diisi'
        },
        notEmpty: {
          msg: 'Kode barang tidak boleh kosong'
        }
      }
    },
    nama: {
      type: DataTypes.STRING(100),
      allowNull: false,
      validate: {
        notNull: {
          msg: 'Nama barang harus diisi'
        },
        notEmpty: {
          msg: 'Nama barang tidak boleh kosong'
        }
      }
    },
    deskripsi: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    kategori_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'kategori',
        key: 'id'
      },
      validate: {
        notNull: {
          msg: 'Kategori harus diisi'
        }
      }
    },
    jumlah: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1,
      validate: {
        notNull: {
          msg: 'Jumlah barang harus diisi'
        },
        min: {
          args: [1],
          msg: 'Jumlah barang minimal 1'
        }
      }
    },
    jumlah_tersedia: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1,
      validate: {
        notNull: {
          msg: 'Jumlah tersedia harus diisi'
        },
        min: {
          args: [0],
          msg: 'Jumlah tersedia tidak boleh negatif'
        }
      }
    },
    kondisi: {
      type: DataTypes.ENUM('baik', 'rusak_ringan', 'rusak_berat'),
      allowNull: false,
      defaultValue: 'baik',
      validate: {
        notNull: {
          msg: 'Kondisi barang harus diisi'
        },
        isIn: {
          args: [['baik', 'rusak_ringan', 'rusak_berat']],
          msg: 'Kondisi barang harus baik, rusak_ringan, atau rusak_berat'
        }
      }
    },
    lokasi: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    tahun_pengadaan: {
      type: DataTypes.INTEGER,
      allowNull: true,
      validate: {
        isInt: {
          msg: 'Tahun pengadaan harus berupa angka'
        },
        min: {
          args: [1900],
          msg: 'Tahun pengadaan tidak valid'
        },
        max: {
          args: [new Date().getFullYear()],
          msg: 'Tahun pengadaan tidak boleh melebihi tahun sekarang'
        }
      }
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    },
    updated_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    }
  }, {
    sequelize,
    modelName: 'Barang',
    tableName: 'barang',
    underscored: true,
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  });
  
  return Barang;
};