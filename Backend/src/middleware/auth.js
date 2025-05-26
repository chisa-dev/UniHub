const jwt = require('jsonwebtoken');
const sequelize = require('../config/database');
const { QueryTypes } = require('sequelize');

/**
 * Authentication middleware
 * Verifies JWT token and attaches user to request
 */
module.exports = async (req, res, next) => {
  try {
    // Check for token in Authorization header
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Authentication required' });
    }
    
    // Extract token
    const token = authHeader.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ message: 'Authentication token missing' });
    }
    
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    
    // Check if user exists in database
    const [user] = await sequelize.query(
      'SELECT id, username, email, role FROM users WHERE id = ?',
      {
        replacements: [decoded.id],
        type: QueryTypes.SELECT
      }
    );
    
    if (!user) {
      return res.status(401).json({ message: 'Invalid authentication token' });
    }
    
    // Attach user to request object
    req.user = user;
    
    // Continue to next middleware or route handler
    next();
  } catch (error) {
    // console.error('[LOG auth middleware] ========= Error:', error);
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ message: 'Invalid authentication token' });
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Authentication token expired' });
    }
    
    return res.status(500).json({ message: 'Authentication error', error: error.message });
  }
}; 