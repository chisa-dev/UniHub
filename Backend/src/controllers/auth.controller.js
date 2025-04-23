const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const sequelize = require('../config/database');

const signup = async (req, res) => {
  const { username, email, password, fullName } = req.body;

  try {
    // Check if user exists
    const [existingUser] = await sequelize.query(
      'SELECT * FROM users WHERE username = ? OR email = ?',
      {
        replacements: [username, email],
        type: sequelize.QueryTypes.SELECT,
      }
    );

    if (existingUser) {
      return res.status(409).json({ 
        message: 'User already exists with this username or email' 
      });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user
    await sequelize.query(
      `INSERT INTO users (id, username, email, password_hash, full_name) 
       VALUES (?, ?, ?, ?, ?)`,
      {
        replacements: [
          uuidv4(),
          username,
          email,
          hashedPassword,
          fullName || null
        ],
      }
    );

    res.status(201).json({ message: 'User created successfully' });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ message: 'Error creating user' });
  }
};

const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    // Find user
    const [user] = await sequelize.query(
      'SELECT * FROM users WHERE email = ?',
      {
        replacements: [email],
        type: sequelize.QueryTypes.SELECT,
      }
    );

    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Check password
    const isValidPassword = await bcrypt.compare(password, user.password_hash);
    if (!isValidPassword) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Generate token
    const token = jwt.sign(
      { 
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role
      },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '24h' }
    );

    // Remove sensitive data
    delete user.password_hash;

    res.json({
      message: 'Login successful',
      token,
      user
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Error during login' });
  }
};

module.exports = {
  signup,
  login
}; 