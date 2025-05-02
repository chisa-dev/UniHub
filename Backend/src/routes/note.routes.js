const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const auth = require('../middleware/auth');
const validate = require('../middleware/validate');
const noteController = require('../controllers/note.controller');

/**
 * @swagger
 * tags:
 *   name: Notes
 *   description: Notes management
 */

/**
 * @swagger
 * /notes:
 *   get:
 *     summary: Get all notes
 *     tags: [Notes]
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
 *         description: List of notes
 */
router.get('/', auth, noteController.getNotes);

/**
 * @swagger
 * /notes/topic/{topicId}:
 *   get:
 *     summary: Get all notes for a specific topic
 *     tags: [Notes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: topicId
 *         required: true
 *         schema:
 *           type: string
 *         description: The topic ID
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number for pagination
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of items per page
 *     responses:
 *       200:
 *         description: List of notes for the specified topic
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 notes:
 *                   type: array
 *                   items:
 *                     type: object
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     total:
 *                       type: integer
 *                     page:
 *                       type: integer
 *                     totalPages:
 *                       type: integer
 *       404:
 *         description: Topic not found
 */
router.get('/topic/:topicId', auth, noteController.getNotesByTopic);

/**
 * @swagger
 * /notes/{id}:
 *   get:
 *     summary: Get note by ID
 *     tags: [Notes]
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
 *         description: Note details
 *       404:
 *         description: Note not found
 */
router.get('/:id', auth, noteController.getNote);

/**
 * @swagger
 * /notes:
 *   post:
 *     summary: Create a new AI-generated note
 *     tags: [Notes]
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
 *               - user_goal
 *               - topicId
 *             properties:
 *               title:
 *                 type: string
 *                 description: The note title
 *               user_goal:
 *                 type: string
 *                 description: The user's goal for the note
 *               topicId:
 *                 type: string
 *                 description: The ID of the topic for which to create the note
 *               isPrivate:
 *                 type: boolean
 *                 default: true
 *                 description: Whether the note is private
 *     responses:
 *       201:
 *         description: Note created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                 title:
 *                   type: string
 *                 topic:
 *                   type: string
 *                 topicId:
 *                   type: string
 *                 date:
 *                   type: string
 *                 content:
 *                   type: string
 *                 readTime:
 *                   type: string
 *                 created_at:
 *                   type: string
 *                 updated_at:
 *                   type: string
 *                 user_id:
 *                   type: string
 *       404:
 *         description: Topic not found
 *       500:
 *         description: Error generating note
 */
router.post(
  '/',
  [
    auth,
    body('title').trim().notEmpty(),
    body('user_goal').trim().notEmpty(),
    body('topicId').notEmpty(),
    body('isPrivate').optional().isBoolean(),
    validate
  ],
  noteController.createNote
);

/**
 * @swagger
 * /notes/{id}:
 *   put:
 *     summary: Update a note
 *     tags: [Notes]
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
 *             properties:
 *               title:
 *                 type: string
 *               content:
 *                 type: string
 *               user_goal:
 *                 type: string
 *               isPrivate:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Note updated successfully
 *       404:
 *         description: Note not found
 */
router.put(
  '/:id',
  [
    auth,
    body('title').optional().trim().notEmpty(),
    body('content').optional().trim().notEmpty(),
    body('user_goal').optional().trim().notEmpty(),
    body('isPrivate').optional().isBoolean(),
    validate
  ],
  noteController.updateNote
);

/**
 * @swagger
 * /notes/{id}:
 *   delete:
 *     summary: Delete a note
 *     tags: [Notes]
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
 *         description: Note deleted successfully
 *       404:
 *         description: Note not found
 */
router.delete('/:id', auth, noteController.deleteNote);

module.exports = router; 