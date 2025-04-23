const { v4: uuidv4 } = require('uuid');
const sequelize = require('../config/database');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Configure multer for audio file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = 'uploads/audio';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1E9)}`;
    cb(null, `${uniqueSuffix}${path.extname(file.originalname)}`);
  }
});

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['audio/mpeg', 'audio/wav', 'audio/mp3'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only MP3 and WAV files are allowed.'));
    }
  },
  limits: {
    fileSize: 50 * 1024 * 1024 // 50MB max file size
  }
}).single('audioFile');

const getRecaps = async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const offset = (page - 1) * limit;
  const { topicId } = req.query;

  try {
    let whereClause = 'WHERE (ar.user_id = ? OR ar.is_private = false)';
    const replacements = [req.user.id];

    if (topicId) {
      whereClause += ' AND ar.topic_id = ?';
      replacements.push(topicId);
    }

    // Get total count
    const [countResult] = await sequelize.query(
      `SELECT COUNT(*) as total 
       FROM audio_recaps ar 
       ${whereClause}`,
      {
        replacements,
        type: sequelize.QueryTypes.SELECT,
      }
    );

    // Get recaps
    const [recaps] = await sequelize.query(
      `SELECT ar.*, t.title as topic_title, u.username as creator_name
       FROM audio_recaps ar
       LEFT JOIN topics t ON ar.topic_id = t.id
       LEFT JOIN users u ON ar.user_id = u.id
       ${whereClause}
       ORDER BY ar.created_at DESC
       LIMIT ? OFFSET ?`,
      {
        replacements: [...replacements, limit, offset],
        type: sequelize.QueryTypes.SELECT,
      }
    );

    res.json({
      recaps,
      pagination: {
        total: countResult.total,
        page,
        totalPages: Math.ceil(countResult.total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching audio recaps:', error);
    res.status(500).json({ message: 'Error fetching audio recaps' });
  }
};

const getRecap = async (req, res) => {
  try {
    const [recap] = await sequelize.query(
      `SELECT ar.*, t.title as topic_title, u.username as creator_name
       FROM audio_recaps ar
       LEFT JOIN topics t ON ar.topic_id = t.id
       LEFT JOIN users u ON ar.user_id = u.id
       WHERE ar.id = ? AND (ar.user_id = ? OR ar.is_private = false)`,
      {
        replacements: [req.params.id, req.user.id],
        type: sequelize.QueryTypes.SELECT,
      }
    );

    if (!recap) {
      return res.status(404).json({ message: 'Audio recap not found' });
    }

    res.json(recap);
  } catch (error) {
    console.error('Error fetching audio recap:', error);
    res.status(500).json({ message: 'Error fetching audio recap' });
  }
};

const createRecap = async (req, res) => {
  upload(req, res, async (err) => {
    if (err instanceof multer.MulterError) {
      return res.status(400).json({ message: err.message });
    } else if (err) {
      return res.status(400).json({ message: err.message });
    }

    const { 
      title, description, topicId, duration,
      isPrivate = true
    } = req.body;

    if (!req.file) {
      return res.status(400).json({ message: 'Audio file is required' });
    }

    try {
      const recapId = uuidv4();
      
      await sequelize.query(
        `INSERT INTO audio_recaps (
          id, title, description, topic_id, user_id,
          file_path, duration, is_private
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        {
          replacements: [
            recapId,
            title,
            description,
            topicId,
            req.user.id,
            req.file.path,
            duration,
            isPrivate
          ],
        }
      );

      res.status(201).json({
        message: 'Audio recap created successfully',
        recapId
      });
    } catch (error) {
      // Clean up uploaded file if database operation fails
      fs.unlinkSync(req.file.path);
      console.error('Error creating audio recap:', error);
      res.status(500).json({ message: 'Error creating audio recap' });
    }
  });
};

const updateRecap = async (req, res) => {
  const { title, description, isPrivate } = req.body;
  const updates = [];
  const values = [];

  if (title !== undefined) {
    updates.push('title = ?');
    values.push(title);
  }
  if (description !== undefined) {
    updates.push('description = ?');
    values.push(description);
  }
  if (isPrivate !== undefined) {
    updates.push('is_private = ?');
    values.push(isPrivate);
  }

  if (updates.length === 0) {
    return res.status(400).json({ message: 'No updates provided' });
  }

  try {
    const [result] = await sequelize.query(
      `UPDATE audio_recaps 
       SET ${updates.join(', ')} 
       WHERE id = ? AND user_id = ?`,
      {
        replacements: [...values, req.params.id, req.user.id],
      }
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ 
        message: 'Audio recap not found or you do not have permission to update it' 
      });
    }

    res.json({ message: 'Audio recap updated successfully' });
  } catch (error) {
    console.error('Error updating audio recap:', error);
    res.status(500).json({ message: 'Error updating audio recap' });
  }
};

const deleteRecap = async (req, res) => {
  try {
    // Get file path before deleting record
    const [recap] = await sequelize.query(
      'SELECT file_path FROM audio_recaps WHERE id = ? AND user_id = ?',
      {
        replacements: [req.params.id, req.user.id],
        type: sequelize.QueryTypes.SELECT,
      }
    );

    if (!recap) {
      return res.status(404).json({ 
        message: 'Audio recap not found or you do not have permission to delete it' 
      });
    }

    // Delete record from database
    await sequelize.query(
      'DELETE FROM audio_recaps WHERE id = ? AND user_id = ?',
      {
        replacements: [req.params.id, req.user.id],
      }
    );

    // Delete audio file
    if (recap.file_path && fs.existsSync(recap.file_path)) {
      fs.unlinkSync(recap.file_path);
    }

    res.json({ message: 'Audio recap deleted successfully' });
  } catch (error) {
    console.error('Error deleting audio recap:', error);
    res.status(500).json({ message: 'Error deleting audio recap' });
  }
};

const transcribeRecap = async (req, res) => {
  try {
    // Get audio file path
    const [recap] = await sequelize.query(
      `SELECT ar.*, t.title as topic_title
       FROM audio_recaps ar
       LEFT JOIN topics t ON ar.topic_id = t.id
       WHERE ar.id = ? AND (ar.user_id = ? OR ar.is_private = false)`,
      {
        replacements: [req.params.id, req.user.id],
        type: sequelize.QueryTypes.SELECT,
      }
    );

    if (!recap) {
      return res.status(404).json({ message: 'Audio recap not found' });
    }

    // Check if transcription already exists
    if (recap.transcription) {
      return res.json({ transcription: recap.transcription });
    }

    // TODO: Implement transcription service integration
    // For now, return a placeholder message
    res.status(501).json({ 
      message: 'Transcription service not implemented yet' 
    });
  } catch (error) {
    console.error('Error transcribing audio recap:', error);
    res.status(500).json({ message: 'Error transcribing audio recap' });
  }
};

module.exports = {
  getRecaps,
  getRecap,
  createRecap,
  updateRecap,
  deleteRecap,
  transcribeRecap
}; 