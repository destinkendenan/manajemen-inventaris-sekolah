const { Model } = require('sequelize');
const bcrypt = require('bcrypt');

module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // Define association here
      User.hasMany(models.Peminjaman, {
        foreignKey: 'user_id',
        as: 'peminjaman'
      });
      
      // For tracking who processed loans
      User.hasMany(models.Peminjaman, {
        foreignKey: 'approved_by',
        as: 'approved_loans'
      });
      
      User.hasMany(models.Peminjaman, {
        foreignKey: 'rejected_by',
        as: 'rejected_loans'
      });
      
      User.hasMany(models.Peminjaman, {
        foreignKey: 'processed_by',
        as: 'processed_returns'
      });
      
      User.hasMany(models.Peminjaman, {
        foreignKey: 'canceled_by',
        as: 'canceled_loans'
      });
    }
  }
  
  User.init({
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false,
      validate: {
        notNull: {
          msg: 'Nama harus diisi'
        },
        notEmpty: {
          msg: 'Nama tidak boleh kosong'
        }
      }
    },
    email: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: {
        msg: 'Email sudah digunakan'
      },
      validate: {
        notNull: {
          msg: 'Email harus diisi'
        },
        notEmpty: {
          msg: 'Email tidak boleh kosong'
        },
        isEmail: {
          msg: 'Format email tidak valid'
        }
      }
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notNull: {
          msg: 'Password harus diisi'
        },
        notEmpty: {
          msg: 'Password tidak boleh kosong'
        },
        len: {
          args: [6, 100],
          msg: 'Password minimal 6 karakter'
        }
      }
    },
    role: {
      type: DataTypes.ENUM('admin', 'petugas', 'user'),
      allowNull: false,
      defaultValue: 'user',
      validate: {
        notNull: {
          msg: 'Role harus diisi'
        },
        isIn: {
          args: [['admin', 'petugas', 'user']],
          msg: 'Role harus admin, petugas, atau user'
        }
      }
    },
    status: {
      type: DataTypes.ENUM('active', 'inactive'),
      allowNull: false,
      defaultValue: 'active',
      validate: {
        notNull: {
          msg: 'Status harus diisi'
        },
        isIn: {
          args: [['active', 'inactive']],
          msg: 'Status harus active atau inactive'
        }
      }
    },
    nip: {
      type: DataTypes.STRING(20),
      allowNull: true,
      comment: 'Nomor Induk Pegawai (untuk admin/petugas)'
    },
    nis: {
      type: DataTypes.STRING(20),
      allowNull: true,
      comment: 'Nomor Induk Siswa (untuk pengguna siswa)'
    },
    phone: {
      type: DataTypes.STRING(15),
      allowNull: true,
      validate: {
        is: {
          args: /^[0-9\+\-\(\)]*$/,
          msg: 'Format nomor telepon tidak valid'
        }
      }
    },
    avatar: {
      type: DataTypes.STRING,
      allowNull: true
    },
    last_login: {
      type: DataTypes.DATE,
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
    modelName: 'User',
    tableName: 'users',
    underscored: true,
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    defaultScope: {
      attributes: { 
        exclude: ['password'] 
      }
    },
    scopes: {
      withPassword: {
        attributes: { include: ['password'] }
      }
    },
    hooks: {
      // Hook to hash password before create/update
      beforeSave: async (user) => {
        if (user.changed('password')) {
          const saltRounds = 10; // Typically would use config value
          user.password = await bcrypt.hash(user.password, saltRounds);
        }
      }
    }
  });
  
  // Instance method to check if password matches
  User.prototype.checkPassword = async function(password) {
    return await bcrypt.compare(password, this.password);
  };
  
  return User;
};