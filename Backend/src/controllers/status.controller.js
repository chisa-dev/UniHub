const db = require('../config/database');

const checkHealth = async (req, res) => {
  try {
    // Check database connection
    await db.query('SELECT 1');
    
    res.status(200).json({
      status: 'ok',
      database: 'connected',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Health check failed:', error);
    res.status(500).json({
      status: 'error',
      database: 'disconnected',
      message: error.message
    });
  }
};

module.exports = {
  checkHealth
}; 