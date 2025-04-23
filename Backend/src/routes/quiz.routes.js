const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const auth = require('../middleware/auth');
const validate = require('../middleware/validate');
const quizController = require('../controllers/quiz.controller');

/**
 * @swagger
 * tags:
 *   name: Quizzes
 *   description: Quiz management and attempts
 */

/**
 * @swagger
 * /quizzes:
 *   get:
 *     summary: Get all quizzes
 *     tags: [Quizzes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: topicId
 *         schema:
 *           type: string
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *     responses:
 *       200:
 *         description: List of quizzes
 */
router.get('/', auth, quizController.getQuizzes);

/**
 * @swagger
 * /quizzes/{id}:
 *   get:
 *     summary: Get quiz by ID with questions
 *     tags: [Quizzes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Quiz details with questions
 *       404:
 *         description: Quiz not found
 */
router.get('/:id', auth, quizController.getQuiz);

/**
 * @swagger
 * /quizzes:
 *   post:
 *     summary: Create a new quiz
 *     tags: [Quizzes]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - topicId
 *               - questions
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               topicId:
 *                 type: string
 *               isAiGenerated:
 *                 type: boolean
 *                 default: false
 *               questions:
 *                 type: array
 *                 items:
 *                   type: object
 *                   required:
 *                     - question
 *                     - questionType
 *                     - correctAnswer
 *                   properties:
 *                     question:
 *                       type: string
 *                     questionType:
 *                       type: string
 *                       enum: [multiple_choice, true_false, short_answer]
 *                     correctAnswer:
 *                       type: string
 *                     options:
 *                       type: array
 *                       items:
 *                         type: string
 *                     explanation:
 *                       type: string
 *     responses:
 *       201:
 *         description: Quiz created successfully
 */
router.post(
  '/',
  [
    auth,
    body('title').trim().notEmpty(),
    body('description').optional().trim(),
    body('topicId').notEmpty(),
    body('questions').isArray({ min: 1 }),
    body('questions.*.question').trim().notEmpty(),
    body('questions.*.questionType').isIn(['multiple_choice', 'true_false', 'short_answer']),
    body('questions.*.correctAnswer').notEmpty(),
    body('questions.*.options').optional().isArray(),
    body('questions.*.explanation').optional().trim(),
    validate
  ],
  quizController.createQuiz
);

/**
 * @swagger
 * /quizzes/{id}/attempt:
 *   post:
 *     summary: Submit a quiz attempt
 *     tags: [Quizzes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - answers
 *             properties:
 *               answers:
 *                 type: object
 *                 additionalProperties:
 *                   type: string
 *     responses:
 *       200:
 *         description: Quiz attempt submitted successfully
 */
router.post(
  '/:id/attempt',
  [
    auth,
    body('answers').isObject(),
    validate
  ],
  quizController.submitQuizAttempt
);

/**
 * @swagger
 * /quizzes/{id}/attempts:
 *   get:
 *     summary: Get quiz attempts for a user
 *     tags: [Quizzes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of quiz attempts
 */
router.get('/:id/attempts', auth, quizController.getQuizAttempts);

module.exports = router; 