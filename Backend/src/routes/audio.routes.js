const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const auth = require('../middleware/auth');
const validate = require('../middleware/validate');
const audioController = require('../controllers/audio.controller');

/**
 * @swagger
 * tags:
 *   name: Audio
 *   description: Audio recaps management
 */

/**
 * @swagger
 * /audio/recaps:
 *   get:
 *     summary: Get all audio recaps
 *     tags: [Audio]
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
 *         description: List of audio recaps
 */
router.get('/recaps', auth, audioController.getRecaps);

/**
 * @swagger
 * /audio/recaps/{id}:
 *   get:
 *     summary: Get audio recap by ID
 *     tags: [Audio]
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
 *         description: Audio recap details
 *       404:
 *         description: Audio recap not found
 */
router.get('/recaps/:id', auth, audioController.getRecap);

/**
 * @swagger
 * /audio/recaps:
 *   post:
 *     summary: Create a new audio recap
 *     tags: [Audio]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - audioFile
 *               - topicId
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               topicId:
 *                 type: string
 *               audioFile:
 *                 type: string
 *                 format: binary
 *               duration:
 *                 type: number
 *               isPrivate:
 *                 type: boolean
 *                 default: true
 *     responses:
 *       201:
 *         description: Audio recap created successfully
 */
router.post(
  '/recaps',
  [
    auth,
    body('title').trim().notEmpty(),
    body('topicId').notEmpty(),
    body('description').optional().trim(),
    body('duration').optional().isNumeric(),
    body('isPrivate').optional().isBoolean(),
    validate
  ],
  audioController.createRecap
);

/**
 * @swagger
 * /audio/recaps/{id}:
 *   put:
 *     summary: Update an audio recap
 *     tags: [Audio]
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
 *               description:
 *                 type: string
 *               isPrivate:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Audio recap updated successfully
 *       404:
 *         description: Audio recap not found
 */
router.put(
  '/recaps/:id',
  [
    auth,
    body('title').optional().trim().notEmpty(),
    body('description').optional().trim(),
    body('isPrivate').optional().isBoolean(),
    validate
  ],
  audioController.updateRecap
);

/**
 * @swagger
 * /audio/recaps/{id}:
 *   delete:
 *     summary: Delete an audio recap
 *     tags: [Audio]
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
 *         description: Audio recap deleted successfully
 *       404:
 *         description: Audio recap not found
 */
router.delete('/recaps/:id', auth, audioController.deleteRecap);

/**
 * @swagger
 * /audio/recaps/{id}/transcribe:
 *   post:
 *     summary: Generate transcription for an audio recap
 *     tags: [Audio]
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
 *         description: Transcription generated successfully
 *       404:
 *         description: Audio recap not found
 */
router.post('/recaps/:id/transcribe', auth, audioController.transcribeRecap);

module.exports = router; 