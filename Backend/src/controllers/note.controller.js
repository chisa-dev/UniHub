const { v4: uuidv4 } = require('uuid');
const sequelize = require('../config/database');
const db = require('../models');
const ragService = require('../services/rag');
const { format } = require('date-fns');

/**
 * Get all notes for the current user
 */
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
      `SELECT n.*, t.title as topic, u.username as creator_name
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

    // Format notes to match the required response format
    const formattedNotes = notes.map(note => ({
      id: note.id,
      title: note.title,
      topic: note.topic || 'Uncategorized',
      topicId: note.topic_id,
      date: format(new Date(note.created_at), 'MMM d, yyyy'),
      content: note.content,
      readTime: note.read_time || '3 min read',
      created_at: note.created_at,
      updated_at: note.updated_at,
      user_id: note.user_id
    }));

    res.json({
      notes: formattedNotes,
      pagination: {
        total: countResult.total,
        page,
        totalPages: Math.ceil(countResult.total / limit)
      }
    });
  } catch (error) {
    console.error('[LOG getNotes] ========= Error fetching notes:', error);
    res.status(500).json({ message: 'Error fetching notes' });
  }
};

/**
 * Get a specific note by ID
 */
const getNote = async (req, res) => {
  try {
    const [note] = await sequelize.query(
      `SELECT n.*, t.title as topic, u.username as creator_name
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

    // Format note to match the required response format
    const formattedNote = {
      id: note.id,
      title: note.title,
      topic: note.topic || 'Uncategorized',
      topicId: note.topic_id,
      date: format(new Date(note.created_at), 'MMM d, yyyy'),
      content: note.content,
      readTime: note.read_time || '3 min read',
      created_at: note.created_at,
      updated_at: note.updated_at,
      user_id: note.user_id,
      user_goal: note.user_goal || ''
    };

    res.json(formattedNote);
  } catch (error) {
    console.error('[LOG getNote] ========= Error fetching note:', error);
    res.status(500).json({ message: 'Error fetching note' });
  }
};

/**
 * Get notes for a specific topic
 */
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
      'SELECT id, title FROM topics WHERE id = ?',
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
      `SELECT n.*, u.username as creator_name
       FROM notes n
       LEFT JOIN users u ON n.user_id = u.id
       ${whereClause}
       ORDER BY n.created_at DESC
       LIMIT ? OFFSET ?`,
      {
        replacements: [...replacements, limit, offset],
        type: sequelize.QueryTypes.SELECT,
      }
    );

    // Format notes to match the required response format
    const formattedNotes = notes.map(note => ({
      id: note.id,
      title: note.title,
      topic: topic.title,
      topicId: note.topic_id,
      date: format(new Date(note.created_at), 'MMM d, yyyy'),
      content: note.content,
      readTime: note.read_time || '3 min read',
      created_at: note.created_at,
      updated_at: note.updated_at,
      user_id: note.user_id
    }));

    res.json({
      notes: formattedNotes,
      pagination: {
        total: countResult.total,
        page,
        totalPages: Math.ceil(countResult.total / limit)
      }
    });
  } catch (error) {
    console.error('[LOG getNotesByTopic] ========= Error fetching notes by topic:', error);
    res.status(500).json({ message: 'Error fetching notes by topic' });
  }
};

/**
 * Create a new AI-generated note based on user input and materials
 */
const createNote = async (req, res) => {
  const { title, user_goal, topicId, isPrivate = true } = req.body;

  try {
    // Validate the topic exists
    const [topic] = await sequelize.query(
      'SELECT id, title FROM topics WHERE id = ?',
      {
        replacements: [topicId],
        type: sequelize.QueryTypes.SELECT,
      }
    );

    if (!topic) {
      return res.status(404).json({ message: 'Topic not found' });
    }

    // Get materials for this topic
    const materials = await db.Material.findAll({
      where: { topic_id: topicId },
      attributes: ['id', 'file_name', 'uploaded_file', 'file_type', 'file_size']
    });

    console.log(`[LOG createNote] ========= Generating note using RAG service for topic: ${topicId}`);
    
    // Generate note using the RAG service
    const generatedNote = await ragService.generateNote({
      title,
      userGoal: user_goal,
      materials,
      userId: req.user.id,
      topicId
    });

    // Create the note
    const noteId = uuidv4();
    await sequelize.query(
      `INSERT INTO notes (id, title, content, topic_id, user_id, is_private, user_goal, read_time) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      {
        replacements: [
          noteId, 
          title, 
          generatedNote.content, 
          topicId, 
          req.user.id, 
          isPrivate, 
          user_goal,
          generatedNote.readTime
        ]
      }
    );

    res.status(201).json({
      message: 'Note created successfully',
      note: {
        id: noteId,
        title,
        content: generatedNote.content,
        topicId,
        date: format(new Date(), 'MMM d, yyyy'),
        readTime: generatedNote.readTime
      }
    });
  } catch (error) {
    console.error('[LOG createNote] ========= Error creating note:', error);
    res.status(500).json({ message: `Error creating note: ${error.message}` });
  }
};

/**
 * Update an existing note
 */
const updateNote = async (req, res) => {
  const { title, content, user_goal, isPrivate } = req.body;
  const updates = [];
  const values = [];

  if (title !== undefined) {
    updates.push('title = ?');
    values.push(title);
  }
  if (content !== undefined) {
    updates.push('content = ?');
    values.push(content);
    // Recalculate read time if content changed
    updates.push('read_time = ?');
    values.push(calculateReadTime(content));
  }
  if (user_goal !== undefined) {
    updates.push('user_goal = ?');
    values.push(user_goal);
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

    // Get updated note
    const [updatedNote] = await sequelize.query(
      `SELECT n.*, t.title as topic
       FROM notes n
       LEFT JOIN topics t ON n.topic_id = t.id
       WHERE n.id = ?`,
      {
        replacements: [req.params.id],
        type: sequelize.QueryTypes.SELECT,
      }
    );

    // Format the response
    const noteData = {
      id: updatedNote.id,
      title: updatedNote.title,
      topic: updatedNote.topic || 'Uncategorized',
      topicId: updatedNote.topic_id,
      date: format(new Date(updatedNote.created_at), 'MMM d, yyyy'),
      content: updatedNote.content,
      readTime: updatedNote.read_time || '3 min read',
      created_at: updatedNote.created_at,
      updated_at: updatedNote.updated_at,
      user_id: updatedNote.user_id,
      user_goal: updatedNote.user_goal || ''
    };

    res.json(noteData);
  } catch (error) {
    console.error('[LOG updateNote] ========= Error updating note:', error);
    res.status(500).json({ message: 'Error updating note' });
  }
};

/**
 * Delete a note
 */
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
    console.error('[LOG deleteNote] ========= Error deleting note:', error);
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