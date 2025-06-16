require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');
const { sequelize, testConnection } = require('./config/db');
const logger = require('./utils/logger');
const errorMiddleware = require('./middleware/errorMiddleware');

// Import routes
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const barangRoutes = require('./routes/barangRoutes');
const kategoriRoutes = require('./routes/kategoriRoutes');
const peminjamanRoutes = require('./routes/peminjamanRoutes');

// Import config
const config = require('./config/config');

// Initialize express app
const app = express();

// Get config
const PORT = config.server.port;

// Middleware setup
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// CORS configuration
app.use(cors({
  origin: '*', // Untuk pengembangan, izinkan semua origin
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Request logging
if (config.server.nodeEnv !== 'production') {
  app.use(morgan('dev'));
}

// Static files
app.use('/uploads', express.static(path.join(__dirname, 'public/uploads')));

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/barang', barangRoutes);
app.use('/api/kategori', kategoriRoutes);
app.use('/api/peminjaman', peminjamanRoutes);

// Root route
app.get('/', (req, res) => {
  res.json({
    message: 'Sistem Manajemen Inventaris Sekolah API',
    version: '1.0.0',
    status: 'running'
  });
});

// Error handling middleware
app.use(errorMiddleware);

// Handle 404 routes
app.use((req, res) => {
  res.status(404).json({
    status: 'error',
    message: 'Route not found'
  });
});

// Start server
const startServer = async () => {
  try {
    // Test database connection
    const dbConnected = await testConnection();
    
    if (!dbConnected) {
      logger.error('Unable to connect to the database. Server will not start.');
      process.exit(1);
    }
    
    // Sync database models (in development only)
    if (config.server.nodeEnv === 'development') {
      logger.info('Syncing database models...');
      await sequelize.sync({ force: false, alter: true });
      logger.info('Database sync complete.');
    }
    
    // Start listening
    app.listen(PORT, () => {
      logger.info(`Server running on port ${PORT} in ${config.server.nodeEnv} mode`);
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
};

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception:', error);
  process.exit(1);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (error) => {
  logger.error('Unhandled Rejection:', error);
  process.exit(1);
});

// Start the server
startServer();

module.exports = app;