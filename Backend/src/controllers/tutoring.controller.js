const { v4: uuidv4 } = require('uuid');
const sequelize = require('../config/database');

const getSessions = async (req, res) => {
  const { role, status, topicId } = req.query;
  
  try {
    let whereClause = '';
    const replacements = [];

    if (role === 'tutor') {
      whereClause = 'WHERE ts.tutor_id = ?';
      replacements.push(req.user.id);
    } else if (role === 'student') {
      whereClause = 'WHERE ts.student_id = ?';
      replacements.push(req.user.id);
    } else {
      whereClause = 'WHERE (ts.tutor_id = ? OR ts.student_id = ?)';
      replacements.push(req.user.id, req.user.id);
    }

    if (status) {
      whereClause += ' AND ts.status = ?';
      replacements.push(status);
    }
    if (topicId) {
      whereClause += ' AND ts.topic_id = ?';
      replacements.push(topicId);
    }

    const [sessions] = await sequelize.query(
      `SELECT ts.*, 
              t.title as topic_title,
              tutor.username as tutor_name,
              student.username as student_name,
              COALESCE(tr.rating, 0) as rating,
              tr.comment as review_comment
       FROM tutoring_sessions ts
       LEFT JOIN topics t ON ts.topic_id = t.id
       LEFT JOIN users tutor ON ts.tutor_id = tutor.id
       LEFT JOIN users student ON ts.student_id = student.id
       LEFT JOIN tutoring_reviews tr ON ts.id = tr.session_id
       ${whereClause}
       ORDER BY ts.start_time DESC`,
      {
        replacements,
        type: sequelize.QueryTypes.SELECT,
      }
    );

    res.json(sessions);
  } catch (error) {
    console.error('Error fetching tutoring sessions:', error);
    res.status(500).json({ message: 'Error fetching tutoring sessions' });
  }
};

const getSession = async (req, res) => {
  try {
    const [session] = await sequelize.query(
      `SELECT ts.*, 
              t.title as topic_title,
              tutor.username as tutor_name,
              student.username as student_name,
              COALESCE(tr.rating, 0) as rating,
              tr.comment as review_comment
       FROM tutoring_sessions ts
       LEFT JOIN topics t ON ts.topic_id = t.id
       LEFT JOIN users tutor ON ts.tutor_id = tutor.id
       LEFT JOIN users student ON ts.student_id = student.id
       LEFT JOIN tutoring_reviews tr ON ts.id = tr.session_id
       WHERE ts.id = ? AND (ts.tutor_id = ? OR ts.student_id = ?)`,
      {
        replacements: [req.params.id, req.user.id, req.user.id],
        type: sequelize.QueryTypes.SELECT,
      }
    );

    if (!session) {
      return res.status(404).json({ message: 'Tutoring session not found' });
    }

    res.json(session);
  } catch (error) {
    console.error('Error fetching tutoring session:', error);
    res.status(500).json({ message: 'Error fetching tutoring session' });
  }
};

const createSession = async (req, res) => {
  const { 
    topicId, tutorId, startTime, endTime,
    description, isOnline = false, location
  } = req.body;

  try {
    // Check if tutor exists and is available
    const [tutor] = await sequelize.query(
      'SELECT id FROM users WHERE id = ? AND role = ?',
      {
        replacements: [tutorId, 'tutor'],
        type: sequelize.QueryTypes.SELECT,
      }
    );

    if (!tutor) {
      return res.status(400).json({ message: 'Invalid tutor' });
    }

    // Check for scheduling conflicts
    const [conflicts] = await sequelize.query(
      `SELECT COUNT(*) as count 
       FROM tutoring_sessions 
       WHERE tutor_id = ? 
       AND status != 'cancelled'
       AND ((start_time BETWEEN ? AND ?) OR (end_time BETWEEN ? AND ?))`,
      {
        replacements: [tutorId, startTime, endTime, startTime, endTime],
        type: sequelize.QueryTypes.SELECT,
      }
    );

    if (conflicts.count > 0) {
      return res.status(400).json({ message: 'Tutor is not available at this time' });
    }

    const sessionId = uuidv4();
    
    // Create session
    await sequelize.query(
      `INSERT INTO tutoring_sessions (
        id, topic_id, tutor_id, student_id, start_time, end_time,
        description, is_online, location, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      {
        replacements: [
          sessionId, topicId, tutorId, req.user.id, startTime, endTime,
          description, isOnline, location, 'pending'
        ],
      }
    );

    // Create calendar event for the session
    const eventId = uuidv4();
    await sequelize.query(
      `INSERT INTO calendar_events (
        id, title, description, start_time, end_time,
        type, location, is_online, user_id
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      {
        replacements: [
          eventId,
          'Tutoring Session',
          description,
          startTime,
          endTime,
          'tutoring',
          location,
          isOnline,
          req.user.id
        ],
      }
    );

    // Add participants to the calendar event
    const participantValues = [
      `('${uuidv4()}', '${eventId}', '${req.user.id}')`,
      `('${uuidv4()}', '${eventId}', '${tutorId}')`
    ].join(',');

    await sequelize.query(
      `INSERT INTO event_participants (id, event_id, user_id) VALUES ${participantValues}`
    );

    res.status(201).json({
      message: 'Tutoring session request created successfully',
      sessionId
    });
  } catch (error) {
    console.error('Error creating tutoring session:', error);
    res.status(500).json({ message: 'Error creating tutoring session' });
  }
};

const updateSessionStatus = async (req, res) => {
  const { status, reason } = req.body;

  try {
    // Check if user is the tutor for this session
    const [session] = await sequelize.query(
      'SELECT * FROM tutoring_sessions WHERE id = ? AND tutor_id = ?',
      {
        replacements: [req.params.id, req.user.id],
        type: sequelize.QueryTypes.SELECT,
      }
    );

    if (!session) {
      return res.status(404).json({ 
        message: 'Session not found or you do not have permission to update it' 
      });
    }

    // Update status
    await sequelize.query(
      `UPDATE tutoring_sessions 
       SET status = ?, status_reason = ?, updated_at = CURRENT_TIMESTAMP
       WHERE id = ?`,
      {
        replacements: [status, reason, req.params.id],
      }
    );

    res.json({ message: 'Session status updated successfully' });
  } catch (error) {
    console.error('Error updating session status:', error);
    res.status(500).json({ message: 'Error updating session status' });
  }
};

const getTutors = async (req, res) => {
  const { topicId, rating } = req.query;

  try {
    let whereClause = "WHERE u.role = 'tutor'";
    const replacements = [];

    if (topicId) {
      whereClause += ' AND tt.topic_id = ?';
      replacements.push(topicId);
    }
    if (rating) {
      whereClause += ' AND COALESCE(AVG(tr.rating), 0) >= ?';
      replacements.push(parseFloat(rating));
    }

    const [tutors] = await sequelize.query(
      `SELECT u.id, u.username, u.email,
              GROUP_CONCAT(DISTINCT t.title) as topics,
              COUNT(DISTINCT ts.id) as total_sessions,
              COALESCE(AVG(tr.rating), 0) as average_rating,
              COUNT(DISTINCT tr.id) as review_count
       FROM users u
       LEFT JOIN tutor_topics tt ON u.id = tt.tutor_id
       LEFT JOIN topics t ON tt.topic_id = t.id
       LEFT JOIN tutoring_sessions ts ON u.id = ts.tutor_id
       LEFT JOIN tutoring_reviews tr ON ts.id = tr.session_id
       ${whereClause}
       GROUP BY u.id
       ORDER BY average_rating DESC`,
      {
        replacements,
        type: sequelize.QueryTypes.SELECT,
      }
    );

    // Format topics
    const formattedTutors = tutors.map(tutor => ({
      ...tutor,
      topics: tutor.topics ? tutor.topics.split(',') : [],
      average_rating: parseFloat(tutor.average_rating).toFixed(1)
    }));

    res.json(formattedTutors);
  } catch (error) {
    console.error('Error fetching tutors:', error);
    res.status(500).json({ message: 'Error fetching tutors' });
  }
};

const submitReview = async (req, res) => {
  const { rating, comment } = req.body;

  try {
    // Check if user was the student in this session
    const [session] = await sequelize.query(
      `SELECT * FROM tutoring_sessions 
       WHERE id = ? AND student_id = ? AND status = 'completed'`,
      {
        replacements: [req.params.id, req.user.id],
        type: sequelize.QueryTypes.SELECT,
      }
    );

    if (!session) {
      return res.status(404).json({ 
        message: 'Session not found or you cannot review it' 
      });
    }

    // Check if already reviewed
    const [existingReview] = await sequelize.query(
      'SELECT id FROM tutoring_reviews WHERE session_id = ?',
      {
        replacements: [req.params.id],
        type: sequelize.QueryTypes.SELECT,
      }
    );

    if (existingReview) {
      return res.status(400).json({ message: 'Session already reviewed' });
    }

    // Create review
    const reviewId = uuidv4();
    await sequelize.query(
      `INSERT INTO tutoring_reviews (id, session_id, rating, comment) 
       VALUES (?, ?, ?, ?)`,
      {
        replacements: [reviewId, req.params.id, rating, comment],
      }
    );

    res.status(201).json({
      message: 'Review submitted successfully',
      reviewId
    });
  } catch (error) {
    console.error('Error submitting review:', error);
    res.status(500).json({ message: 'Error submitting review' });
  }
};

module.exports = {
  getSessions,
  getSession,
  createSession,
  updateSessionStatus,
  getTutors,
  submitReview
}; 