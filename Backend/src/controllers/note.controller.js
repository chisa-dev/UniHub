const { v4: uuidv4 } = require('uuid');
const sequelize = require('../config/database');

const getNotes = async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const offset = (page - 1) * limit;
  const { topicId } = req.query;

  try {
    let whereClause = 'WHERE (n.user_id = ? OR n.is_private = false)';
    const replacements = [req.user.id];

    if (topicId) {
      whereClause += ' AND n.topic_id = ?';
      replacements.push(topicId);
    }

    // Get total count
    const [countResult] = await sequelize.query(
      `SELECT COUNT(*) as total 
       FROM notes n 
       ${whereClause}`,
      {
        replacements,
        type: sequelize.QueryTypes.SELECT,
      }
    );

    // Get notes
    const notes = await sequelize.query(
      `SELECT n.*, t.title as topic_title, u.username as creator_name
       FROM notes n
       LEFT JOIN topics t ON n.topic_id = t.id
       LEFT JOIN users u ON n.user_id = u.id
       ${whereClause}
       ORDER BY n.created_at DESC
       LIMIT ? OFFSET ?`,
      {
        replacements: [...replacements, limit, offset],
        type: sequelize.QueryTypes.SELECT,
      }
    );

    res.json({
      notes,
      pagination: {
        total: countResult.total,
        page,
        totalPages: Math.ceil(countResult.total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching notes:', error);
    res.status(500).json({ message: 'Error fetching notes' });
  }
};

const getNote = async (req, res) => {
  try {
    const [note] = await sequelize.query(
      `SELECT n.*, t.title as topic_title, u.username as creator_name
       FROM notes n
       LEFT JOIN topics t ON n.topic_id = t.id
       LEFT JOIN users u ON n.user_id = u.id
       WHERE n.id = ? AND (n.user_id = ? OR n.is_private = false)`,
      {
        replacements: [req.params.id, req.user.id],
        type: sequelize.QueryTypes.SELECT,
      }
    );

    if (!note) {
      return res.status(404).json({ message: 'Note not found' });
    }

    res.json(note);
  } catch (error) {
    console.error('Error fetching note:', error);
    res.status(500).json({ message: 'Error fetching note' });
  }
};

const getNotesByTopic = async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const offset = (page - 1) * limit;
  const { topicId } = req.params;

  try {
    if (!topicId) {
      return res.status(400).json({ message: 'Topic ID is required' });
    }
    
    // Verify topic exists
    const [topic] = await sequelize.query(
      'SELECT id FROM topics WHERE id = ?',
      {
        replacements: [topicId],
        type: sequelize.QueryTypes.SELECT,
      }
    );

    if (!topic) {
      return res.status(404).json({ message: 'Topic not found' });
    }

    let whereClause = 'WHERE n.topic_id = ? AND (n.user_id = ? OR n.is_private = false)';
    const replacements = [topicId, req.user.id];

    // Get total count
    const [countResult] = await sequelize.query(
      `SELECT COUNT(*) as total 
       FROM notes n 
       ${whereClause}`,
      {
        replacements,
        type: sequelize.QueryTypes.SELECT,
      }
    );

    // Get notes
    const notes = await sequelize.query(
      `SELECT n.*, t.title as topic_title, u.username as creator_name
       FROM notes n
       LEFT JOIN topics t ON n.topic_id = t.id
       LEFT JOIN users u ON n.user_id = u.id
       ${whereClause}
       ORDER BY n.created_at DESC
       LIMIT ? OFFSET ?`,
      {
        replacements: [...replacements, limit, offset],
        type: sequelize.QueryTypes.SELECT,
      }
    );

    res.json({
      notes: notes[0],
      pagination: {
        total: countResult.total,
        page,
        totalPages: Math.ceil(countResult.total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching notes by topic:', error);
    res.status(500).json({ message: 'Error fetching notes by topic' });
  }
};

const createNote = async (req, res) => {
  const { title, content, topicId, isPrivate = true } = req.body;

  try {
    const noteId = uuidv4();
    await sequelize.query(
      `INSERT INTO notes (id, title, content, topic_id, user_id, is_private) 
       VALUES (?, ?, ?, ?, ?, ?)`,
      {
        replacements: [noteId, title, content, topicId, req.user.id, isPrivate],
      }
    );

    res.status(201).json({
      message: 'Note created successfully',
      noteId
    });
  } catch (error) {
    console.error('Error creating note:', error);
    res.status(500).json({ message: 'Error creating note' });
  }
};

const updateNote = async (req, res) => {
  const { title, content, isPrivate } = req.body;
  const updates = [];
  const values = [];

  if (title !== undefined) {
    updates.push('title = ?');
    values.push(title);
  }
  if (content !== undefined) {
    updates.push('content = ?');
    values.push(content);
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
      `UPDATE notes 
       SET ${updates.join(', ')} 
       WHERE id = ? AND user_id = ?`,
      {
        replacements: [...values, req.params.id, req.user.id],
      }
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ 
        message: 'Note not found or you do not have permission to update it' 
      });
    }

    res.json({ message: 'Note updated successfully' });
  } catch (error) {
    console.error('Error updating note:', error);
    res.status(500).json({ message: 'Error updating note' });
  }
};

const deleteNote = async (req, res) => {
  try {
    const [result] = await sequelize.query(
      'DELETE FROM notes WHERE id = ? AND user_id = ?',
      {
        replacements: [req.params.id, req.user.id],
      }
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ 
        message: 'Note not found or you do not have permission to delete it' 
      });
    }

    res.json({ message: 'Note deleted successfully' });
  } catch (error) {
    console.error('Error deleting note:', error);
    res.status(500).json({ message: 'Error deleting note' });
  }
};

module.exports = {
  getNotes,
  getNote,
  getNotesByTopic,
  createNote,
  updateNote,
  deleteNote
}; 