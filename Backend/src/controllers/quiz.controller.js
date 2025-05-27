const { v4: uuidv4 } = require('uuid');
const sequelize = require('../config/database');
const ragService = require('../services/rag');

const getQuizzes = async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const offset = (page - 1) * limit;
  const { topicId } = req.query;

  try {
    let whereClause = 'WHERE q.user_id = ?';
    const replacements = [req.user.id];

    if (topicId) {
      whereClause += ' AND q.topic_id = ?';
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
    const quizzes = await sequelize.query(
      `SELECT q.*, t.title as topic_title, 
              u.username as creator_name,
              COUNT(DISTINCT qq.id) as question_count,
              COUNT(DISTINCT qa.id) as attempt_count
       FROM quizzes q
       LEFT JOIN topics t ON q.topic_id = t.id
       LEFT JOIN users u ON q.user_id = u.id
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
    console.error('[LOG quiz] ========= Error fetching quizzes:', error);
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
       LEFT JOIN users u ON q.user_id = u.id
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
      'SELECT COUNT(*) as total FROM quizzes q WHERE q.topic_id = ? AND q.user_id = ?',
      {
        replacements: [topicId, req.user.id],
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
       LEFT JOIN users u ON q.user_id = u.id
       LEFT JOIN quiz_questions qq ON q.id = qq.quiz_id
       LEFT JOIN quiz_attempts qa ON q.id = qa.quiz_id
       WHERE q.topic_id = ? AND q.user_id = ?
       GROUP BY q.id
       ORDER BY q.created_at DESC
       LIMIT ? OFFSET ?`,
      {
        replacements: [topicId, req.user.id, limit, offset],
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

const createRagQuiz = async (req, res) => {
  try {
    const { title, difficulty, numQuestions, topicId } = req.body;
    
    // Validate required fields
    if (!title || !topicId) {
      return res.status(400).json({ message: 'Title and topic ID are required' });
    }
    
    // Set defaults for optional fields
    const quizDifficulty = difficulty || 'medium';
    const questionCount = parseInt(numQuestions) || 5;
    
    // Verify topic exists and belongs to user
    const [topic] = await sequelize.query(
      'SELECT id FROM topics WHERE id = ? AND user_id = ?',
      {
        replacements: [topicId, req.user.id],
        type: sequelize.QueryTypes.SELECT,
      }
    );
    
    if (!topic) {
      return res.status(404).json({ message: 'Topic not found or does not belong to user' });
    }
    
    // Generate quiz using RAG service
    const generatedQuiz = await ragService.generateQuiz({
      title,
      difficulty: quizDifficulty,
      numQuestions: questionCount,
      userId: req.user.id,
      topicId
    });
    
    if (!generatedQuiz || !generatedQuiz.questions || generatedQuiz.questions.length === 0) {
      return res.status(500).json({ message: 'Failed to generate quiz questions' });
    }
    
    // Store the quiz in the database
    const quizId = generatedQuiz.quiz.id;
    
    // Create a simple JSON for the questions column
    const questionsJson = JSON.stringify({ 
      count: generatedQuiz.questions.length, 
      type: 'rag_generated'  
    });
    
    // Insert quiz
    await sequelize.query(
      `INSERT INTO quizzes (id, title, description, topic_id, user_id, difficulty, is_public, is_ai_generated, questions, created_at, updated_at) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
      {
        replacements: [
          quizId,
          generatedQuiz.quiz.title,
          generatedQuiz.quiz.description,
          topicId,
          req.user.id,
          quizDifficulty,
          false, // is_public
          true,  // is_ai_generated
          questionsJson
        ],
      }
    );
    
    // Insert questions and options
    for (const question of generatedQuiz.questions) {
      const questionId = question.id || uuidv4();
      
      // Insert question
      await sequelize.query(
        `INSERT INTO quiz_questions (id, quiz_id, question, question_type, correct_answer, order_index, created_at, updated_at) 
         VALUES (?, ?, ?, ?, ?, ?, NOW(), NOW())`,
        {
          replacements: [
            questionId,
            quizId,
            question.question,
            question.questionType || 'multiple_choice',
            question.correctAnswer,
            0, // order_index
          ],
        }
      );
      
      // Insert options
      if (question.options && Array.isArray(question.options)) {
        for (let i = 0; i < question.options.length; i++) {
          const optionId = uuidv4();
          const optionText = question.options[i];
          const isCorrect = optionText === question.correctAnswer;
          
          await sequelize.query(
            `INSERT INTO quiz_question_options (id, question_id, option_text, is_correct, order_index, created_at, updated_at) 
             VALUES (?, ?, ?, ?, ?, NOW(), NOW())`,
            {
              replacements: [
                optionId,
                questionId,
                optionText,
                isCorrect,
                i,
              ],
            }
          );
        }
      }
    }
    
    res.status(201).json({
      message: 'Quiz generated successfully',
      quiz: {
        id: quizId,
        title: generatedQuiz.quiz.title,
        description: generatedQuiz.quiz.description,
        difficulty: quizDifficulty,
        topic_id: topicId,
        question_count: generatedQuiz.questions.length
      }
    });
  } catch (error) {
    console.error('[LOG quiz] ========= Error generating RAG quiz:', error);
    res.status(500).json({ message: 'Error generating RAG quiz' });
  }
};

const submitQuizAttempt = async (req, res) => {
  const { answers } = req.body;
  const quizId = req.params.id;

  try {
    // Validate input
    if (!answers || typeof answers !== 'object') {
      return res.status(400).json({ message: 'Invalid answers format. Answers must be an object.' });
    }

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

    // Check if 'answers' column exists in quiz_attempts table
    try {
      const [columns] = await sequelize.query(
        "SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'quiz_attempts' AND COLUMN_NAME = 'answers'"
      );
      
      // If 'answers' column doesn't exist, add it
      if (columns.length === 0) {
        console.log('[LOG quiz] ========= Adding answers column to quiz_attempts table');
        await sequelize.query("ALTER TABLE quiz_attempts ADD COLUMN answers JSON");
      }
    } catch (schemaError) {
      console.error('[LOG quiz] ========= Error checking/updating schema:', schemaError);
      // Continue anyway, the main query will fail if the column doesn't exist
    }

    // Save attempt
    const attemptId = uuidv4();
    
    try {
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
    } catch (insertError) {
      console.error('[LOG quiz] ========= Error inserting quiz attempt:', insertError);
      
      // Try a simplified insert without the answers column if that's the issue
      if (insertError.message && insertError.message.includes("Unknown column 'answers'")) {
        await sequelize.query(
          `INSERT INTO quiz_attempts (id, user_id, quiz_id, score, completed_at) 
           VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)`,
          {
            replacements: [
              attemptId,
              req.user.id,
              quizId,
              scorePercentage
            ],
          }
        );
        
        console.log('[LOG quiz] ========= Quiz attempt saved without answers');
      } else {
        // Re-throw if it's not the specific error we're handling
        throw insertError;
      }
    }

    // Update quiz progress statistics
    try {
      const { QuizProgress } = require('../models');
      
      // Find or create quiz progress
      let quizProgress = await QuizProgress.findOne({
        where: {
          user_id: req.user.id,
          quiz_id: quizId
        }
      });
      
      if (quizProgress) {
        // Update existing record
        quizProgress.attempts_count += 1;
        quizProgress.last_attempt_date = new Date();
        
        // Update best score if the new score is higher
        if (quizProgress.best_score === null || scorePercentage > quizProgress.best_score) {
          quizProgress.best_score = scorePercentage;
        }
        
        // Update progress (consider quiz completed if score >= 70%)
        const newProgress = scorePercentage >= 70 ? 100 : Math.max(quizProgress.progress, scorePercentage);
        quizProgress.progress = newProgress;
        
        await quizProgress.save();
        console.log('[LOG quiz] ========= Updated quiz progress for user:', req.user.id, 'quiz:', quizId);
      } else {
        // Create new record
        const progress = scorePercentage >= 70 ? 100 : scorePercentage;
        quizProgress = await QuizProgress.create({
          user_id: req.user.id,
          quiz_id: quizId,
          progress,
          best_score: scorePercentage,
          attempts_count: 1,
          last_attempt_date: new Date()
        });
        console.log('[LOG quiz] ========= Created new quiz progress for user:', req.user.id, 'quiz:', quizId);
      }
    } catch (progressError) {
      console.error('[LOG quiz] ========= Error updating quiz progress:', progressError);
      // Don't fail the main request if progress update fails
    }

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
  createRagQuiz,
  submitQuizAttempt,
  getQuizAttempts
}; 