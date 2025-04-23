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
 *     summary: Create a new note
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
 *               - content
 *               - topicId
 *             properties:
 *               title:
 *                 type: string
 *               content:
 *                 type: string
 *               topicId:
 *                 type: string
 *               isPrivate:
 *                 type: boolean
 *                 default: true
 *     responses:
 *       201:
 *         description: Note created successfully
 */
router.post(
  '/',
  [
    auth,
    body('title').trim().notEmpty(),
    body('content').trim().notEmpty(),
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