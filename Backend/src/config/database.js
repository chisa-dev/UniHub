require('dotenv').config();
const { Sequelize } = require('sequelize');

const env = process.env.NODE_ENV || 'development';
const config = {
  development: {
    username: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'unihub_db',
    host: process.env.DB_HOST || '127.0.0.1',
    dialect: 'mysql',
    logging: false
  },
  test: {
    username: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'unihub_test',
    host: process.env.DB_HOST || '127.0.0.1',
    dialect: 'mysql',
    logging: false
  },
  production: {
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    host: process.env.DB_HOST,
    dialect: 'mysql',
    logging: false,
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false
      }
    },
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    }
  }
};

// Allow using DATABASE_URL environment variable (common in cloud deployments)
if (process.env.DATABASE_URL && env === 'production') {
  module.exports = new Sequelize(process.env.DATABASE_URL, {
    dialect: 'mysql',
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false
      }
    },
    logging: false,
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    }
  });
} else {
  module.exports = new Sequelize(
    config[env].database,
    config[env].username,
    config[env].password,
    {
      host: config[env].host,
      dialect: config[env].dialect,
      logging: config[env].logging,
      dialectOptions: config[env].dialectOptions,
      pool: config[env].pool
    }
  );
} 