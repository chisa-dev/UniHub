const { v4: uuidv4 } = require('uuid');
const sequelize = require('../config/database');

const getTopics = async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const offset = (page - 1) * limit;

  try {
    // Get total count
    const [countResult] = await sequelize.query(
      'SELECT COUNT(*) as total FROM topics WHERE is_public = true OR creator_id = ?',
      {
        replacements: [req.user.id],
        type: sequelize.QueryTypes.SELECT,
      }
    );

    // Get topics
    const topics = await sequelize.query(
      `SELECT t.*, u.username as creator_name 
       FROM topics t 
       LEFT JOIN users u ON t.creator_id = u.id 
       WHERE t.is_public = true OR t.creator_id = ? 
       ORDER BY t.created_at DESC 
       LIMIT ? OFFSET ?`,
      {
        replacements: [req.user.id, limit, offset],
        type: sequelize.QueryTypes.SELECT,
      }
    );

    // Add debug logging
    console.log(`[LOG getTopics] ========= Found ${topics.length} topics`);
    
    res.json({
      topics,
      pagination: {
        total: countResult.total,
        page,
        totalPages: Math.ceil(countResult.total / limit)
      }
    });
  } catch (error) {
    console.error('[LOG getTopics ERROR] =========', error);
    res.status(500).json({ message: 'Error fetching topics' });
  }
};

const getTopic = async (req, res) => {
  try {
    const [topic] = await sequelize.query(
      `SELECT t.*, u.username as creator_name 
       FROM topics t 
       LEFT JOIN users u ON t.creator_id = u.id 
       WHERE t.id = ? AND (t.is_public = true OR t.creator_id = ?)`,
      {
        replacements: [req.params.id, req.user.id],
        type: sequelize.QueryTypes.SELECT,
      }
    );

    if (!topic) {
      return res.status(404).json({ message: 'Topic not found' });
    }

    res.json(topic);
  } catch (error) {
    console.error('Error fetching topic:', error);
    res.status(500).json({ message: 'Error fetching topic' });
  }
};

const createTopic = async (req, res) => {
  const { title, description, isPublic = false } = req.body;

  try {
    const topicId = uuidv4();
    await sequelize.query(
      `INSERT INTO topics (id, title, description, creator_id, is_public) 
       VALUES (?, ?, ?, ?, ?)`,
      {
        replacements: [topicId, title, description, req.user.id, isPublic],
      }
    );

    res.status(201).json({ 
      message: 'Topic created successfully',
      topicId 
    });
  } catch (error) {
    console.error('Error creating topic:', error);
    res.status(500).json({ message: 'Error creating topic' });
  }
};

const updateTopic = async (req, res) => {
  const { title, description, isPublic } = req.body;
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
  if (isPublic !== undefined) {
    updates.push('is_public = ?');
    values.push(isPublic);
  }

  if (updates.length === 0) {
    return res.status(400).json({ message: 'No updates provided' });
  }

  try {
    const [result] = await sequelize.query(
      `UPDATE topics 
       SET ${updates.join(', ')} 
       WHERE id = ? AND creator_id = ?`,
      {
        replacements: [...values, req.params.id, req.user.id],
      }
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ 
        message: 'Topic not found or you do not have permission to update it' 
      });
    }

    res.json({ message: 'Topic updated successfully' });
  } catch (error) {
    console.error('Error updating topic:', error);
    res.status(500).json({ message: 'Error updating topic' });
  }
};

const deleteTopic = async (req, res) => {
  try {
    const [result] = await sequelize.query(
      'DELETE FROM topics WHERE id = ? AND creator_id = ?',
      {
        replacements: [req.params.id, req.user.id],
      }
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ 
        message: 'Topic not found or you do not have permission to delete it' 
      });
    }

    res.json({ message: 'Topic deleted successfully' });
  } catch (error) {
    console.error('Error deleting topic:', error);
    res.status(500).json({ message: 'Error deleting topic' });
  }
};

module.exports = {
  getTopics,
  getTopic,
  createTopic,
  updateTopic,
  deleteTopic
}; 