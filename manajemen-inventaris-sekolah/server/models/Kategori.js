const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Kategori extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // Define association here
      Kategori.hasMany(models.Barang, {
        foreignKey: 'kategori_id',
        as: 'barangs'
      });
    }
  }
  
  Kategori.init({
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    nama: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: {
        msg: 'Nama kategori sudah digunakan'
      },
      validate: {
        notNull: {
          msg: 'Nama kategori harus diisi'
        },
        notEmpty: {
          msg: 'Nama kategori tidak boleh kosong'
        }
      }
    },
    deskripsi: {
      type: DataTypes.TEXT,
      allowNull: true
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
    modelName: 'Kategori',
    tableName: 'kategori',
    underscored: true,
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  });
  
  return Kategori;
};