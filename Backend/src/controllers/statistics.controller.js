const { Op } = require('sequelize');
const sequelize = require('../config/database');
const { 
  User, 
  TopicProgress, 
  QuizProgress, 
  NoteProgress, 
  StudySession, 
  Topic, 
  Quiz
} = require('../models');

/**
 * Get comprehensive statistics for a user
 */
const getUserStatistics = async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Get topic progress statistics
    const topicProgress = await TopicProgress.findAll({
      where: { user_id: userId },
      include: [
        {
          model: Topic,
          as: 'topic',
          attributes: ['title']
        }
      ],
      order: [['updated_at', 'DESC']]
    });
    
    // Get quiz progress statistics
    const quizProgress = await QuizProgress.findAll({
      where: { user_id: userId },
      include: [
        {
          model: Quiz,
          as: 'quiz',
          attributes: ['title']
        }
      ],
      order: [['updated_at', 'DESC']]
    });
    
    // Get note progress statistics
    const noteProgress = await sequelize.query(`
      SELECT np.*, n.title
      FROM note_progress np
      JOIN notes n ON np.note_id = n.id
      WHERE np.user_id = ?
      ORDER BY np.updated_at DESC
    `, {
      replacements: [userId],
      type: sequelize.QueryTypes.SELECT
    });
    
    // Get study hours for the last 7 days
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    
    const studySessions = await StudySession.findAll({
      where: {
        user_id: userId,
        study_date: {
          [Op.gte]: oneWeekAgo
        }
      },
      order: [['study_date', 'ASC']]
    });
    
    // Get aggregate statistics
    const [aggregateStats] = await sequelize.query(`
      SELECT 
        COUNT(DISTINCT tp.topic_id) as total_topics_studied,
        COUNT(DISTINCT qp.quiz_id) as total_quizzes_attempted,
        COUNT(DISTINCT np.note_id) as total_notes_read,
        COALESCE(SUM(ss.hours), 0) as total_study_hours,
        COALESCE(AVG(tp.progress), 0) as avg_topic_progress,
        COALESCE(AVG(qp.progress), 0) as avg_quiz_progress,
        COALESCE(AVG(qp.best_score), 0) as avg_quiz_score,
        COALESCE(SUM(tp.materials_count), 0) as total_materials
      FROM users u
      LEFT JOIN topic_progress tp ON u.id = tp.user_id
      LEFT JOIN quiz_progress qp ON u.id = qp.user_id
      LEFT JOIN note_progress np ON u.id = np.user_id
      LEFT JOIN study_sessions ss ON u.id = ss.user_id
      WHERE u.id = ?
    `, {
      replacements: [userId],
      type: sequelize.QueryTypes.SELECT
    });
    
    // Format the response
    const formattedTopicProgress = topicProgress.map(tp => ({
      topicId: tp.topic_id,
      topicTitle: tp.topic?.title || 'Unknown Topic',
      progress: tp.progress,
      materialsCount: tp.materials_count,
      updatedAt: tp.updated_at
    }));
    
    const formattedQuizProgress = quizProgress.map(qp => ({
      quizId: qp.quiz_id,
      quizTitle: qp.quiz?.title || 'Unknown Quiz',
      progress: qp.progress,
      bestScore: qp.best_score,
      attemptsCount: qp.attempts_count,
      updatedAt: qp.updated_at
    }));
    
    const formattedNoteProgress = noteProgress && Array.isArray(noteProgress) ? 
      noteProgress.map(np => ({
        noteId: np.note_id,
        noteTitle: np.title || 'Unknown Note',
        progress: np.progress,
        updatedAt: np.updated_at
      })) : [];
    
    const formattedStudySessions = studySessions.map(ss => {
      // If there's a previous day's record, calculate productivity change
      const productivityChange = ss.productivity_score ? 
        (ss.productivity_score - (ss.previousDayScore || ss.productivity_score)) : 
        0;
      
      return {
        date: ss.study_date,
        hours: ss.hours,
        productivityScore: ss.productivity_score || 0,
        productivityChange,
        updatedAt: ss.updated_at
      };
    });
    
    res.json({
      topics_progress: formattedTopicProgress,
      quiz_progress: formattedQuizProgress,
      note_progress: formattedNoteProgress,
      study_hours: formattedStudySessions,
      summary: {
        total_topics_studied: aggregateStats.total_topics_studied || 0,
        total_quizzes_attempted: aggregateStats.total_quizzes_attempted || 0,
        total_notes_read: aggregateStats.total_notes_read || 0,
        total_study_hours: aggregateStats.total_study_hours || 0,
        avg_topic_progress: parseFloat(aggregateStats.avg_topic_progress || 0).toFixed(2),
        avg_quiz_progress: parseFloat(aggregateStats.avg_quiz_progress || 0).toFixed(2),
        avg_quiz_score: parseFloat(aggregateStats.avg_quiz_score || 0).toFixed(2),
        total_materials: aggregateStats.total_materials || 0
      }
    });
  } catch (error) {
    console.error('[LOG statistics] ========= Error fetching user statistics:', error);
    console.error('[LOG statistics] ========= Error details:', {
      message: error.message,
      stack: error.stack,
      name: error.name
    });
    res.status(500).json({
      message: 'Error fetching user statistics',
      error: error.message
    });
  }
};

/**
 * Update topic progress
 */
const updateTopicProgress = async (req, res) => {
  try {
    const userId = req.user.id;
    const { topicId, progress, materialsCount } = req.body;
    
    if (!topicId || progress === undefined) {
      return res.status(400).json({
        message: 'Topic ID and progress are required'
      });
    }
    
    // Validate progress is between 0 and 100
    if (progress < 0 || progress > 100) {
      return res.status(400).json({
        message: 'Progress must be between 0 and 100'
      });
    }
    
    // Check if topic exists
    const [topic] = await sequelize.query(
      'SELECT id FROM topics WHERE id = ?',
      {
        replacements: [topicId],
        type: sequelize.QueryTypes.SELECT
      }
    );
    
    if (!topic) {
      return res.status(404).json({
        message: 'Topic not found'
      });
    }
    
    // Find or create topic progress
    let topicProgress = await TopicProgress.findOne({
      where: {
        user_id: userId,
        topic_id: topicId
      }
    });
    
    if (topicProgress) {
      // Update existing record
      topicProgress.progress = progress;
      if (materialsCount !== undefined) {
        topicProgress.materials_count = materialsCount;
      }
      topicProgress.last_activity = new Date();
      await topicProgress.save();
    } else {
      // Create new record
      topicProgress = await TopicProgress.create({
        user_id: userId,
        topic_id: topicId,
        progress,
        materials_count: materialsCount || 0,
        last_activity: new Date()
      });
    }
    
    res.json({
      message: 'Topic progress updated successfully',
      progress: topicProgress
    });
  } catch (error) {
    console.error('Error updating topic progress:', error);
    res.status(500).json({
      message: 'Error updating topic progress',
      error: error.message
    });
  }
};

/**
 * Update quiz progress
 */
const updateQuizProgress = async (req, res) => {
  try {
    const userId = req.user.id;
    const { quizId, progress, score } = req.body;
    
    if (!quizId || progress === undefined) {
      return res.status(400).json({
        message: 'Quiz ID and progress are required'
      });
    }
    
    // Validate progress is between 0 and 100
    if (progress < 0 || progress > 100) {
      return res.status(400).json({
        message: 'Progress must be between 0 and 100'
      });
    }
    
    // Check if quiz exists
    const [quiz] = await sequelize.query(
      'SELECT id FROM quizzes WHERE id = ?',
      {
        replacements: [quizId],
        type: sequelize.QueryTypes.SELECT
      }
    );
    
    if (!quiz) {
      return res.status(404).json({
        message: 'Quiz not found'
      });
    }
    
    // Find or create quiz progress
    let quizProgress = await QuizProgress.findOne({
      where: {
        user_id: userId,
        quiz_id: quizId
      }
    });
    
    if (quizProgress) {
      // Update existing record
      quizProgress.progress = progress;
      quizProgress.attempts_count += 1;
      quizProgress.last_attempt_date = new Date();
      
      // Update best score if the new score is higher
      if (score !== undefined && (quizProgress.best_score === null || score > quizProgress.best_score)) {
        quizProgress.best_score = score;
      }
      
      await quizProgress.save();
    } else {
      // Create new record
      quizProgress = await QuizProgress.create({
        user_id: userId,
        quiz_id: quizId,
        progress,
        best_score: score || null,
        attempts_count: 1,
        last_attempt_date: new Date()
      });
    }
    
    res.json({
      message: 'Quiz progress updated successfully',
      progress: quizProgress
    });
  } catch (error) {
    console.error('Error updating quiz progress:', error);
    res.status(500).json({
      message: 'Error updating quiz progress',
      error: error.message
    });
  }
};

/**
 * Update note progress
 */
const updateNoteProgress = async (req, res) => {
  try {
    const userId = req.user.id;
    const { noteId, progress, lastReadPosition } = req.body;
    
    if (!noteId || progress === undefined) {
      return res.status(400).json({
        message: 'Note ID and progress are required'
      });
    }
    
    // Validate progress is between 0 and 100
    if (progress < 0 || progress > 100) {
      return res.status(400).json({
        message: 'Progress must be between 0 and 100'
      });
    }
    
    // Check if note exists
    const [note] = await sequelize.query(
      'SELECT id FROM notes WHERE id = ?',
      {
        replacements: [noteId],
        type: sequelize.QueryTypes.SELECT
      }
    );
    
    if (!note) {
      return res.status(404).json({
        message: 'Note not found'
      });
    }
    
    // Find or create note progress
    let noteProgress = await NoteProgress.findOne({
      where: {
        user_id: userId,
        note_id: noteId
      }
    });
    
    if (noteProgress) {
      // Update existing record
      noteProgress.progress = progress;
      if (lastReadPosition !== undefined) {
        noteProgress.last_read_position = lastReadPosition;
      }
      await noteProgress.save();
    } else {
      // Create new record
      noteProgress = await NoteProgress.create({
        user_id: userId,
        note_id: noteId,
        progress,
        last_read_position: lastReadPosition || 0
      });
    }
    
    res.json({
      message: 'Note progress updated successfully',
      progress: noteProgress
    });
  } catch (error) {
    console.error('[LOG statistics] ========= Error updating note progress:', error);
    res.status(500).json({
      message: 'Error updating note progress',
      error: error.message
    });
  }
};

/**
 * Log study session
 */
const logStudySession = async (req, res) => {
  try {
    const userId = req.user.id;
    const { date, hours, productivityScore, notes } = req.body;
    
    if (!hours) {
      return res.status(400).json({
        message: 'Study hours are required'
      });
    }
    
    // Validate hours
    if (hours <= 0 || hours > 24) {
      return res.status(400).json({
        message: 'Study hours must be between 0 and 24'
      });
    }
    
    // Format date or use today
    const studyDate = date ? new Date(date) : new Date();
    
    // Check if there's already a session for this date
    let studySession = await StudySession.findOne({
      where: {
        user_id: userId,
        study_date: studyDate
      }
    });
    
    if (studySession) {
      // Update existing record
      studySession.hours = hours;
      if (productivityScore !== undefined) {
        studySession.productivity_score = productivityScore;
      }
      if (notes) {
        studySession.notes = notes;
      }
      await studySession.save();
    } else {
      // Create new record
      studySession = await StudySession.create({
        user_id: userId,
        study_date: studyDate,
        hours,
        productivity_score: productivityScore || null,
        notes: notes || null
      });
    }
    
    res.json({
      message: 'Study session logged successfully',
      session: studySession
    });
  } catch (error) {
    console.error('Error logging study session:', error);
    res.status(500).json({
      message: 'Error logging study session',
      error: error.message
    });
  }
};

module.exports = {
  getUserStatistics,
  updateTopicProgress,
  updateQuizProgress,
  updateNoteProgress,
  logStudySession
}; 