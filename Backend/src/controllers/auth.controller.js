const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { v4: uuidv4 } = require('uuid');
const sequelize = require('../config/database');
const { QueryTypes } = require('sequelize');
const emailService = require('../services/emailService');

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

const forgotPassword = async (req, res) => {
  const { email } = req.body;

  try {
    console.log(`[LOG forgot_password] ========= Password reset request for email: ${email}`);
    
    // Find user by email
    const [user] = await sequelize.query(
      'SELECT * FROM users WHERE email = ?',
      {
        replacements: [email],
        type: QueryTypes.SELECT,
      }
    );

    if (!user) {
      // Don't reveal if email exists or not for security
      return res.json({
        success: true,
        message: 'If an account with that email exists, we have sent a password reset link.'
      });
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenExpiry = new Date(Date.now() + 3600000); // 1 hour from now

    // Save reset token to database
    await sequelize.query(
      'UPDATE users SET reset_password_token = ?, reset_password_expires = ? WHERE id = ?',
      {
        replacements: [resetToken, resetTokenExpiry, user.id],
        type: QueryTypes.UPDATE
      }
    );

    // Send reset email
    try {
      await emailService.sendPasswordResetEmail(email, resetToken, user.username || user.full_name || 'User');
      console.log(`[LOG forgot_password] ========= Password reset email sent to ${email}`);
    } catch (emailError) {
      console.error(`[LOG forgot_password] ========= Failed to send email to ${email}:`, emailError);
      // Clear the reset token if email fails
      await sequelize.query(
        'UPDATE users SET reset_password_token = NULL, reset_password_expires = NULL WHERE id = ?',
        {
          replacements: [user.id],
          type: QueryTypes.UPDATE
        }
      );
      return res.status(500).json({
        success: false,
        message: 'Failed to send password reset email. Please try again later.'
      });
    }

    res.json({
      success: true,
      message: 'If an account with that email exists, we have sent a password reset link.'
    });

  } catch (error) {
    console.error('[LOG forgot_password] ========= Error in forgot password:', error);
    res.status(500).json({
      success: false,
      message: 'An error occurred while processing your request. Please try again later.'
    });
  }
};

const resetPassword = async (req, res) => {
  const { token, newPassword } = req.body;

  try {
    console.log(`[LOG reset_password] ========= Password reset attempt with token: ${token?.substring(0, 8)}...`);
    
    // Find user by reset token and check if token is not expired
    const [user] = await sequelize.query(
      'SELECT * FROM users WHERE reset_password_token = ? AND reset_password_expires > NOW()',
      {
        replacements: [token],
        type: QueryTypes.SELECT,
      }
    );

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired reset token. Please request a new password reset.'
      });
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // Update password and clear reset token
    await sequelize.query(
      'UPDATE users SET password_hash = ?, reset_password_token = NULL, reset_password_expires = NULL WHERE id = ?',
      {
        replacements: [hashedPassword, user.id],
        type: QueryTypes.UPDATE
      }
    );

    // Send confirmation email
    try {
      await emailService.sendPasswordChangeConfirmation(user.email, user.username || user.full_name || 'User');
      console.log(`[LOG reset_password] ========= Password change confirmation sent to ${user.email}`);
    } catch (emailError) {
      console.error(`[LOG reset_password] ========= Failed to send confirmation email:`, emailError);
      // Don't fail the request if confirmation email fails
    }

    console.log(`[LOG reset_password] ========= Password successfully reset for user ${user.username}`);

    res.json({
      success: true,
      message: 'Password has been reset successfully. You can now log in with your new password.'
    });

  } catch (error) {
    console.error('[LOG reset_password] ========= Error in reset password:', error);
    res.status(500).json({
      success: false,
      message: 'An error occurred while resetting your password. Please try again later.'
    });
  }
};

const validateResetToken = async (req, res) => {
  const { token } = req.params;

  try {
    console.log(`[LOG validate_token] ========= Validating reset token: ${token?.substring(0, 8)}...`);
    
    // Check if token exists and is not expired
    const [user] = await sequelize.query(
      'SELECT id, email, username FROM users WHERE reset_password_token = ? AND reset_password_expires > NOW()',
      {
        replacements: [token],
        type: QueryTypes.SELECT,
      }
    );

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired reset token.'
      });
    }

    res.json({
      success: true,
      message: 'Token is valid.',
      data: {
        email: user.email,
        username: user.username
      }
    });

  } catch (error) {
    console.error('[LOG validate_token] ========= Error validating token:', error);
    res.status(500).json({
      success: false,
      message: 'An error occurred while validating the token.'
    });
  }
};

module.exports = {
  signup,
  login,
  forgotPassword,
  resetPassword,
  validateResetToken
}; 