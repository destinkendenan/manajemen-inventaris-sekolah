const { Sequelize } = require('sequelize');
const dotenv = require('dotenv');

dotenv.config();

// Konfigurasi database dari variabel lingkungan
const dbName = process.env.DB_DATABASE || 'manajemen_inventaris';
const dbUser = process.env.DB_USERNAME || 'root';
const dbPassword = process.env.DB_PASSWORD || '';
const dbHost = process.env.DB_HOST || 'localhost';
const dbPort = process.env.DB_PORT || 3306;
const dbDialect = process.env.DB_DIALECT || 'mysql';

// Inisialisasi Sequelize
const sequelize = new Sequelize(dbName, dbUser, dbPassword, {
  host: dbHost,
  port: dbPort,
  dialect: dbDialect,
  logging: false, // Ubah ke false untuk menghilangkan warning
  dialectOptions: {
    dateStrings: true,
    typeCast: true
  },
  timezone: '+07:00' // untuk zona waktu Indonesia
});

// Fungsi untuk menguji koneksi database
const testConnection = async () => {
  try {
    await sequelize.authenticate();
    console.log('Database connection has been established successfully.');
    return true;
  } catch (error) {
    console.error('Unable to connect to the database:', error);
    return false;
  }
};

module.exports = { sequelize, testConnection };