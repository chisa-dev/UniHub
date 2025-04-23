const { v4: uuidv4 } = require('uuid');
const sequelize = require('../config/database');

const getQuizzes = async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const offset = (page - 1) * limit;
  const { topicId } = req.query;

  try {
    let whereClause = '';
    const replacements = [];

    if (topicId) {
      whereClause = 'WHERE q.topic_id = ?';
      replacements.push(topicId);
    }

    // Get total count
    const [countResult] = await sequelize.query(
      `SELECT COUNT(*) as total FROM quizzes q ${whereClause}`,
      {
        replacements,
        type: sequelize.QueryTypes.SELECT,
      }
    );

    // Get quizzes
    const [quizzes] = await sequelize.query(
      `SELECT q.*, t.title as topic_title, 
              u.username as creator_name,
              COUNT(DISTINCT qq.id) as question_count,
              COUNT(DISTINCT qa.id) as attempt_count
       FROM quizzes q
       LEFT JOIN topics t ON q.topic_id = t.id
       LEFT JOIN users u ON q.created_by = u.id
       LEFT JOIN quiz_questions qq ON q.id = qq.quiz_id
       LEFT JOIN quiz_attempts qa ON q.id = qa.quiz_id
       ${whereClause}
       GROUP BY q.id
       ORDER BY q.created_at DESC
       LIMIT ? OFFSET ?`,
      {
        replacements: [...replacements, limit, offset],
        type: sequelize.QueryTypes.SELECT,
      }
    );

    res.json({
      quizzes,
      pagination: {
        total: countResult.total,
        page,
        totalPages: Math.ceil(countResult.total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching quizzes:', error);
    res.status(500).json({ message: 'Error fetching quizzes' });
  }
};

const getQuiz = async (req, res) => {
  try {
    // Get quiz details
    const [quiz] = await sequelize.query(
      `SELECT q.*, t.title as topic_title, u.username as creator_name
       FROM quizzes q
       LEFT JOIN topics t ON q.topic_id = t.id
       LEFT JOIN users u ON q.created_by = u.id
       WHERE q.id = ?`,
      {
        replacements: [req.params.id],
        type: sequelize.QueryTypes.SELECT,
      }
    );

    if (!quiz) {
      return res.status(404).json({ message: 'Quiz not found' });
    }

    // Get questions
    const [results] = await sequelize.query(
      'SELECT * FROM quiz_questions WHERE quiz_id = ?',
      {
        replacements: [req.params.id],
        type: sequelize.QueryTypes.SELECT,
      }
    );

    const questions = Array.isArray(results) ? results : [results];

    if (!questions || questions.length === 0) {
      return res.status(404).json({ message: 'No questions found for this quiz' });
    }

    // Don't send correct answers if user hasn't attempted the quiz yet
    const sanitizedQuestions = questions.map(q => ({
      id: q.id,
      question: q.question,
      options: q.options,
      quiz_id: q.quiz_id
    }));

    res.status(200).json({
      quiz,
      questions: sanitizedQuestions
    });
  } catch (error) {
    console.error('Error fetching quiz:', error);
    res.status(500).json({ message: 'Error fetching quiz' });
  }
};

const createQuiz = async (req, res) => {
  const { title, description, topicId, questions, isAiGenerated = false } = req.body;

  try {
    const quizId = uuidv4();
    
    // Create quiz
    await sequelize.query(
      `INSERT INTO quizzes (id, title, description, topic_id, created_by, is_ai_generated) 
       VALUES (?, ?, ?, ?, ?, ?)`,
      {
        replacements: [quizId, title, description, topicId, req.user.id, isAiGenerated],
      }
    );

    // Create questions
    for (const q of questions) {
      await sequelize.query(
        `INSERT INTO quiz_questions (id, quiz_id, question, question_type, correct_answer, options, explanation) 
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        {
          replacements: [
            uuidv4(),
            quizId,
            q.question,
            q.questionType,
            q.correctAnswer,
            JSON.stringify(q.options || null),
            q.explanation || null
          ],
        }
      );
    }

    res.status(201).json({
      message: 'Quiz created successfully',
      quizId
    });
  } catch (error) {
    console.error('Error creating quiz:', error);
    res.status(500).json({ message: 'Error creating quiz' });
  }
};

const submitQuizAttempt = async (req, res) => {
  const { answers } = req.body;
  const quizId = req.params.id;

  try {
    // Get questions with correct answers
    const [questions] = await sequelize.query(
      'SELECT id, correct_answer FROM quiz_questions WHERE quiz_id = ?',
      {
        replacements: [quizId],
        type: sequelize.QueryTypes.SELECT,
      }
    );

    if (questions.length === 0) {
      return res.status(404).json({ message: 'Quiz not found' });
    }

    // Calculate score
    let score = 0;
    for (const question of questions) {
      if (answers[question.id] === question.correct_answer) {
        score++;
      }
    }

    const scorePercentage = (score / questions.length) * 100;

    // Save attempt
    const attemptId = uuidv4();
    await sequelize.query(
      `INSERT INTO quiz_attempts (id, user_id, quiz_id, score, answers, completed_at) 
       VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP)`,
      {
        replacements: [
          attemptId,
          req.user.id,
          quizId,
          scorePercentage,
          JSON.stringify(answers)
        ],
      }
    );

    res.json({
      message: 'Quiz attempt submitted successfully',
      attemptId,
      score: scorePercentage,
      totalQuestions: questions.length,
      correctAnswers: score
    });
  } catch (error) {
    console.error('Error submitting quiz attempt:', error);
    res.status(500).json({ message: 'Error submitting quiz attempt' });
  }
};

const getQuizAttempts = async (req, res) => {
  try {
    const [attempts] = await sequelize.query(
      `SELECT qa.*, u.username
       FROM quiz_attempts qa
       LEFT JOIN users u ON qa.user_id = u.id
       WHERE qa.quiz_id = ? AND (qa.user_id = ? OR u.role = 'teacher')
       ORDER BY qa.completed_at DESC`,
      {
        replacements: [req.params.id, req.user.id],
        type: sequelize.QueryTypes.SELECT,
      }
    );

    res.json(attempts);
  } catch (error) {
    console.error('Error fetching quiz attempts:', error);
    res.status(500).json({ message: 'Error fetching quiz attempts' });
  }
};

module.exports = {
  getQuizzes,
  getQuiz,
  createQuiz,
  submitQuizAttempt,
  getQuizAttempts
}; 