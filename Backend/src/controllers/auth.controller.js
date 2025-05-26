const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const sequelize = require('../config/database');
const { QueryTypes } = require('sequelize');

const signup = async (req, res) => {
  const { username, email, password, fullName } = req.body;

  try {
    // Debug log
    console.log(`[LOG signup] ========= Signup attempt with username: ${username}, email: ${email}`);
    
    // Check if user exists
    const existingUserByUsername = await sequelize.query(
      'SELECT * FROM users WHERE username = ?',
      {
        replacements: [username],
        type: QueryTypes.SELECT,
      }
    );
    
    const existingUserByEmail = await sequelize.query(
      'SELECT * FROM users WHERE email = ?',
      {
        replacements: [email],
        type: QueryTypes.SELECT,
      }
    );
    
    // Debug log existing user check
    console.log(`[LOG signup] ========= Existing user by username: ${JSON.stringify(existingUserByUsername)}`);
    console.log(`[LOG signup] ========= Existing user by email: ${JSON.stringify(existingUserByEmail)}`);

    if (existingUserByUsername.length > 0) {
      return res.status(409).json({ 
        message: 'Username already taken' 
      });
    }
    
    if (existingUserByEmail.length > 0) {
      return res.status(409).json({ 
        message: 'Email already registered' 
      });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Get current timestamp
    const now = new Date();
    
    // Generate UUID for the new user
    const userId = uuidv4();

    // Create user
    await sequelize.query(
      `INSERT INTO users (id, username, email, password_hash, full_name, created_at, updated_at) 
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      {
        replacements: [
          userId,
          username,
          email,
          hashedPassword,
          fullName || null,
          now,
          now
        ],
        type: QueryTypes.INSERT
      }
    );
    
    // Fetch the newly created user
    const [newUser] = await sequelize.query(
      'SELECT * FROM users WHERE id = ?',
      {
        replacements: [userId],
        type: QueryTypes.SELECT,
      }
    );
    
    // Generate token
    const token = jwt.sign(
      { 
        id: newUser.id,
        username: newUser.username,
        email: newUser.email,
        role: newUser.role
      },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '24h' }
    );
    
    // Remove sensitive data
    delete newUser.password_hash;
    
    // Log successful signup
    console.log(`[LOG signup] ========= User ${username} successfully registered with ID ${userId}`);

    res.status(201).json({ 
      message: 'User created successfully',
      token,
      user: newUser
    });
  } catch (error) {
    
    res.status(500).json({ message: 'Error creating user', error: error.message });
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
        type: QueryTypes.SELECT,
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
    // console.error('[LOG login ERROR] =========', error);
    res.status(500).json({ message: 'Error during login', error: error.message });
  }
};

module.exports = {
  signup,
  login
}; 