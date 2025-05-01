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
       LEFT JOIN users u ON q.creator_id = u.id
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
       LEFT JOIN users u ON q.creator_id = u.id
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
    const questions = await sequelize.query(
      'SELECT * FROM quiz_questions WHERE quiz_id = ?',
      {
        replacements: [req.params.id],
        type: sequelize.QueryTypes.SELECT,
      }
    );

    if (!questions || questions.length === 0) {
      return res.status(404).json({ message: 'No questions found for this quiz' });
    }

    // Get options for each question
    const questionsWithOptions = await Promise.all(questions.map(async (question) => {
      try {
        // Try to get options from quiz_question_options table
        const options = await sequelize.query(
          'SELECT option_text, is_correct FROM quiz_question_options WHERE question_id = ?',
          {
            replacements: [question.id],
            type: sequelize.QueryTypes.SELECT,
          }
        );

        // Return a sanitized question with options array
        const sanitizedQuestion = {
          id: question.id,
          question: question.question,
          questionType: question.question_type,
          quiz_id: question.quiz_id,
          options: options.map(opt => opt.option_text)
        };

        return sanitizedQuestion;
      } catch (error) {
        console.error('[LOG quiz] ========= Error fetching options:', error);
        // If there's an error, just return the question without options
        return {
          id: question.id,
          question: question.question,
          questionType: question.question_type,
          quiz_id: question.quiz_id,
          options: []
        };
      }
    }));

    res.status(200).json({
      quiz,
      questions: questionsWithOptions
    });
  } catch (error) {
    console.error('Error fetching quiz:', error);
    res.status(500).json({ message: 'Error fetching quiz' });
  }
};

const getQuizzesByTopic = async (req, res) => {
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

    // Get total count
    const [countResult] = await sequelize.query(
      'SELECT COUNT(*) as total FROM quizzes q WHERE q.topic_id = ?',
      {
        replacements: [topicId],
        type: sequelize.QueryTypes.SELECT,
      }
    );

    // Get quizzes
    const quizzes = await sequelize.query(
      `SELECT q.*, t.title as topic_title, 
              u.username as creator_name,
              COUNT(DISTINCT qq.id) as question_count,
              COUNT(DISTINCT qa.id) as attempt_count
       FROM quizzes q
       LEFT JOIN topics t ON q.topic_id = t.id
       LEFT JOIN users u ON q.creator_id = u.id
       LEFT JOIN quiz_questions qq ON q.id = qq.quiz_id
       LEFT JOIN quiz_attempts qa ON q.id = qa.quiz_id
       WHERE q.topic_id = ?
       GROUP BY q.id
       ORDER BY q.created_at DESC
       LIMIT ? OFFSET ?`,
      {
        replacements: [topicId, limit, offset],
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
    console.error('[LOG quiz] ========= Error fetching quizzes by topic:', error);
    res.status(500).json({ message: 'Error fetching quizzes by topic' });
  }
};

const createQuiz = async (req, res) => {
  const { title, description, topicId, questions, isAiGenerated = false } = req.body;

  try {
    const quizId = uuidv4();
    
    // Create quiz
    await sequelize.query(
      `INSERT INTO quizzes (id, title, description, topic_id, creator_id, is_ai_generated) 
       VALUES (?, ?, ?, ?, ?, ?)`,
      {
        replacements: [quizId, title, description, topicId, req.user.id, isAiGenerated],
      }
    );

    // Create questions
    for (const q of questions) {
      // Check if we have the quiz_question_options table
      try {
        // First insert the question
        const questionId = uuidv4();
        await sequelize.query(
          `INSERT INTO quiz_questions (id, quiz_id, question, question_type, correct_answer, explanation) 
           VALUES (?, ?, ?, ?, ?, ?)`,
          {
            replacements: [
              questionId,
              quizId,
              q.question,
              q.questionType,
              q.correctAnswer,
              q.explanation || null
            ],
          }
        );

        // If options exist, insert them separately
        if (q.options && q.options.length > 0) {
          try {
            // Try to insert into quiz_question_options table
            for (let i = 0; i < q.options.length; i++) {
              await sequelize.query(
                `INSERT INTO quiz_question_options (id, question_id, option_text, is_correct) 
                 VALUES (?, ?, ?, ?)`,
                {
                  replacements: [
                    uuidv4(),
                    questionId,
                    q.options[i],
                    q.options[i] === q.correctAnswer // Set is_correct flag
                  ],
                }
              );
            }
          } catch (optionError) {
            console.error('[LOG quiz] ========= Error inserting options:', optionError);
            // Continue with quiz creation even if options fail
          }
        }
      } catch (questionError) {
        console.error('[LOG quiz] ========= Error creating question:', questionError);
        throw questionError; // Rethrow to be caught by main try/catch
      }
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
    const questions = await sequelize.query(
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
    console.error('[LOG quiz] ========= Error submitting quiz attempt:', error);
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
  getQuizzesByTopic,
  createQuiz,
  submitQuizAttempt,
  getQuizAttempts
}; 