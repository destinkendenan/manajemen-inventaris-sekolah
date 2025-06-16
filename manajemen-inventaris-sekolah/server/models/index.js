const fs = require('fs');
const path = require('path');
const Sequelize = require('sequelize');
const config = require('../config/config');
const logger = require('../utils/logger');

// Get database configuration
const dbConfig = config.database;

// Initialize Sequelize
const sequelize = new Sequelize(
  dbConfig.database,
  dbConfig.username,
  dbConfig.password,
  {
    host: dbConfig.host,
    port: dbConfig.port,
    dialect: dbConfig.dialect,
    logging: dbConfig.logging ? msg => logger.debug(msg) : false,
    pool: dbConfig[process.env.NODE_ENV]?.pool,
    timezone: dbConfig.timezone,
    dialectOptions: dbConfig.dialectOptions
  }
);

// Initialize db object
const db = {};

// Read all model files in the directory (excluding this file)
fs.readdirSync(__dirname)
  .filter(file => 
    file.indexOf('.') !== 0 && 
    file !== path.basename(__filename) && 
    file.slice(-3) === '.js'
  )
  .forEach(file => {
    // Import model
    const model = require(path.join(__dirname, file))(
      sequelize,
      Sequelize.DataTypes
    );
    // Add model to db object
    db[model.name] = model;
  });

// Set up associations between models
Object.keys(db).forEach(modelName => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

// Add Sequelize instance and Sequelize class to db
db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;