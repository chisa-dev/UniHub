const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/database');

const signup = async (req, res) => {
  try {
    const { firstName, lastName, username, password } = req.body;

    // Check if username already exists
    const [existingUsers] = await db.query(
      'SELECT id FROM users WHERE username = ?',
      [username]
    );

    if (existingUsers.length > 0) {
      return res.status(409).json({
        status: 'error',
        message: 'Username already exists'
      });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Insert new user
    const [result] = await db.query(
      'INSERT INTO users (firstName, lastName, username, password) VALUES (?, ?, ?, ?)',
      [firstName, lastName, username, hashedPassword]
    );

    res.status(201).json({
      status: 'success',
      message: 'User created successfully',
      userId: result.insertId
    });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error creating user'
    });
  }
};

const signin = async (req, res) => {
  try {
    const { username, password } = req.body;

    // Get user
    const [users] = await db.query(
      'SELECT * FROM users WHERE username = ?',
      [username]
    );

    if (users.length === 0) {
      return res.status(401).json({
        status: 'error',
        message: 'Invalid credentials'
      });
    }

    const user = users[0];

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({
        status: 'error',
        message: 'Invalid credentials'
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user.id, username: user.username },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );

    res.json({
      status: 'success',
      token,
      user: {
        id: user.id,
        username: user.username,
        firstName: user.firstName,
        lastName: user.lastName
      }
    });
  } catch (error) {
    console.error('Signin error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error signing in'
    });
  }
};

module.exports = {
  signup,
  signin
}; 