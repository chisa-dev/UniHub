const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const auth = require('../middleware/auth');
const validate = require('../middleware/validate');
const aiAssistantController = require('../controllers/ai-assistant.controller');

/**
 * @swagger
 * tags:
 *   name: AI Assistant
 *   description: AI-powered learning assistance
 */

/**
 * @swagger
 * /ai-assistant/chat:
 *   post:
 *     summary: Chat with the AI assistant
 *     tags: [AI Assistant]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - message
 *             properties:
 *               message:
 *                 type: string
 *               context:
 *                 type: object
 *                 properties:
 *                   topicId:
 *                     type: string
 *                   previousMessages:
 *                     type: array
 *                     items:
 *                       type: object
 *                       properties:
 *                         role:
 *                           type: string
 *                           enum: [user, assistant]
 *                         content:
 *                           type: string
 *     responses:
 *       200:
 *         description: AI assistant response
 */
router.post(
  '/chat',
  [
    auth,
    body('message').trim().notEmpty(),
    body('context').optional(),
    validate
  ],
  aiAssistantController.chat
);

/**
 * @swagger
 * /ai-assistant/explain:
 *   post:
 *     summary: Get AI explanation for a topic or concept
 *     tags: [AI Assistant]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - topic
 *             properties:
 *               topic:
 *                 type: string
 *               level:
 *                 type: string
 *                 enum: [beginner, intermediate, advanced]
 *                 default: intermediate
 *               format:
 *                 type: string
 *                 enum: [text, bullet_points, step_by_step]
 *                 default: text
 *     responses:
 *       200:
 *         description: AI explanation response
 */
router.post(
  '/explain',
  [
    auth,
    body('topic').trim().notEmpty(),
    body('level').optional().isIn(['beginner', 'intermediate', 'advanced']),
    body('format').optional().isIn(['text', 'bullet_points', 'step_by_step']),
    validate
  ],
  aiAssistantController.explain
);

/**
 * @swagger
 * /ai-assistant/quiz-generation:
 *   post:
 *     summary: Generate quiz questions for a topic
 *     tags: [AI Assistant]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - topicId
 *             properties:
 *               topicId:
 *                 type: string
 *               questionCount:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 20
 *                 default: 5
 *               difficulty:
 *                 type: string
 *                 enum: [easy, medium, hard]
 *                 default: medium
 *               types:
 *                 type: array
 *                 items:
 *                   type: string
 *                   enum: [multiple_choice, true_false, short_answer]
 *     responses:
 *       200:
 *         description: Generated quiz questions
 */
router.post(
  '/quiz-generation',
  [
    auth,
    body('topicId').notEmpty(),
    body('questionCount').optional().isInt({ min: 1, max: 20 }),
    body('difficulty').optional().isIn(['easy', 'medium', 'hard']),
    body('types').optional().isArray(),
    validate
  ],
  aiAssistantController.generateQuiz
);

/**
 * @swagger
 * /ai-assistant/summarize:
 *   post:
 *     summary: Generate a summary of provided content
 *     tags: [AI Assistant]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - content
 *             properties:
 *               content:
 *                 type: string
 *               maxLength:
 *                 type: integer
 *                 default: 500
 *               format:
 *                 type: string
 *                 enum: [paragraph, bullet_points, key_points]
 *                 default: paragraph
 *     responses:
 *       200:
 *         description: Generated summary
 */
router.post(
  '/summarize',
  [
    auth,
    body('content').trim().notEmpty(),
    body('maxLength').optional().isInt({ min: 100, max: 2000 }),
    body('format').optional().isIn(['paragraph', 'bullet_points', 'key_points']),
    validate
  ],
  aiAssistantController.summarize
);

module.exports = router; 