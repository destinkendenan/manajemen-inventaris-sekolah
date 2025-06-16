require('dotenv').config();

/**
 * Application configuration
 * Uses environment variables with sensible defaults
 */
module.exports = {
  // Server configuration
  server: {
    port: process.env.PORT || 5000,
    host: process.env.HOST || '0.0.0.0',
    nodeEnv: process.env.NODE_ENV || 'development',
    cors: {
      origin: process.env.CORS_ORIGIN || '*',
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization']
    }
  },

  // Database configuration
  database: {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 3306,
    username: process.env.DB_USERNAME || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_DATABASE || 'manajemen_inventaris',
    dialect: process.env.DB_DIALECT || 'mysql',
    logging: process.env.DB_LOGGING === 'true',
    timezone: '+07:00', // WIB - Indonesia Western Time
    // Define DB specific configs for different environments
    development: {
      logging: true
    },
    test: {
      logging: false
    },
    production: {
      logging: false,
      pool: {
        max: 5,
        min: 0,
        acquire: 30000,
        idle: 10000
      }
    }
  },

  // JWT Authentication
  jwt: {
    secret: process.env.JWT_SECRET || 'your-secret-key-change-in-production',
    expiresIn: process.env.JWT_EXPIRES_IN || '24h',
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
    algorithm: 'HS256'
  },

  // Password hashing
  bcrypt: {
    saltRounds: parseInt(process.env.BCRYPT_SALT_ROUNDS || '10', 10)
  },
  
  // Pagination defaults
  pagination: {
    defaultLimit: 10,
    maxLimit: 100
  },
  
  // File upload configuration
  upload: {
    directory: process.env.UPLOAD_DIR || 'public/uploads',
    maxSize: parseInt(process.env.UPLOAD_MAX_SIZE || '5242880', 10), // 5MB
    allowedTypes: ['image/jpeg', 'image/png', 'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
  },
  
  // Email configuration (if needed for notifications)
  email: {
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT || 587,
    secure: process.env.EMAIL_SECURE === 'true',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    },
    from: process.env.EMAIL_FROM || 'inventaris@sekolah.com'
  },
  
  // Application specific settings
  app: {
    name: 'Sistem Manajemen Inventaris Sekolah',
    url: process.env.APP_URL || 'http://localhost:3000',
    defaultAdminEmail: process.env.DEFAULT_ADMIN_EMAIL || 'admin@example.com',
    defaultAdminPassword: process.env.DEFAULT_ADMIN_PASSWORD || 'admin123',
    maxPeminjamanPerUser: parseInt(process.env.MAX_PEMINJAMAN_PER_USER || '5', 10),
    defaultDurasiPeminjaman: parseInt(process.env.DEFAULT_DURASI_PEMINJAMAN || '7', 10) // 7 days
  },
  
  // Logger configuration
  logger: {
    level: process.env.LOG_LEVEL || 'info',
    dir: process.env.LOG_DIR || 'logs'
  }
};