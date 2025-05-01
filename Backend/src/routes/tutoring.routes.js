const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const auth = require('../middleware/auth');
const validate = require('../middleware/validate');
const tutoringController = require('../controllers/tutoring.controller');

/**
 * @swagger
 * tags:
 *   name: Tutoring
 *   description: Tutoring sessions and requests management
 */

/**
 * @swagger
 * /tutoring/sessions:
 *   get:
 *     summary: Get all tutoring sessions
 *     tags: [Tutoring]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: role
 *         schema:
 *           type: string
 *           enum: [tutor, student]
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [pending, accepted, completed, cancelled]
 *       - in: query
 *         name: topicId
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of tutoring sessions
 */
router.get('/sessions', auth, tutoringController.getSessions);

/**
 * @swagger
 * /tutoring/tutors:
 *   get:
 *     summary: Get available tutors
 *     tags: [Tutoring]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: topicId
 *         schema:
 *           type: string
 *       - in: query
 *         name: rating
 *         schema:
 *           type: number
 *           minimum: 0
 *           maximum: 5
 *     responses:
 *       200:
 *         description: List of available tutors
 */
router.get('/tutors', auth, tutoringController.getTutors);

/**
 * @swagger
 * /tutoring/sessions/topic/{topicId}:
 *   get:
 *     summary: Get all tutoring sessions for a specific topic
 *     tags: [Tutoring]
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
 *         name: status
 *         schema:
 *           type: string
 *           enum: [pending, accepted, completed, cancelled]
 *         description: Filter sessions by status
 *     responses:
 *       200:
 *         description: List of tutoring sessions for the specified topic
 *       404:
 *         description: Topic not found
 */
router.get('/sessions/topic/:topicId', auth, tutoringController.getSessionsByTopic);

/**
 * @swagger
 * /tutoring/sessions/{id}:
 *   get:
 *     summary: Get tutoring session by ID
 *     tags: [Tutoring]
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
 *         description: Tutoring session details
 *       404:
 *         description: Session not found
 */
router.get('/sessions/:id', auth, tutoringController.getSession);

/**
 * @swagger
 * /tutoring/sessions:
 *   post:
 *     summary: Request a new tutoring session
 *     tags: [Tutoring]
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
 *               - tutorId
 *               - startTime
 *               - endTime
 *             properties:
 *               topicId:
 *                 type: string
 *               tutorId:
 *                 type: string
 *               startTime:
 *                 type: string
 *                 format: date-time
 *               endTime:
 *                 type: string
 *                 format: date-time
 *               description:
 *                 type: string
 *               isOnline:
 *                 type: boolean
 *                 default: false
 *               location:
 *                 type: string
 *     responses:
 *       201:
 *         description: Tutoring session request created successfully
 */
router.post(
  '/sessions',
  [
    auth,
    body('topicId').notEmpty(),
    body('tutorId').notEmpty(),
    body('startTime').isISO8601(),
    body('endTime').isISO8601(),
    body('description').optional().trim(),
    body('isOnline').optional().isBoolean(),
    body('location').optional().trim(),
    validate
  ],
  tutoringController.createSession
);

/**
 * @swagger
 * /tutoring/sessions/{id}/status:
 *   put:
 *     summary: Update tutoring session status
 *     tags: [Tutoring]
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
 *               - status
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [accepted, completed, cancelled]
 *               reason:
 *                 type: string
 *     responses:
 *       200:
 *         description: Session status updated successfully
 */
router.put(
  '/sessions/:id/status',
  [
    auth,
    body('status').isIn(['accepted', 'completed', 'cancelled']),
    body('reason').optional().trim(),
    validate
  ],
  tutoringController.updateSessionStatus
);

/**
 * @swagger
 * /tutoring/sessions/{id}/review:
 *   post:
 *     summary: Submit a review for a tutoring session
 *     tags: [Tutoring]
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
 *               - rating
 *             properties:
 *               rating:
 *                 type: number
 *                 minimum: 1
 *                 maximum: 5
 *               comment:
 *                 type: string
 *     responses:
 *       201:
 *         description: Review submitted successfully
 */
router.post(
  '/sessions/:id/review',
  [
    auth,
    body('rating').isFloat({ min: 1, max: 5 }),
    body('comment').optional().trim(),
    validate
  ],
  tutoringController.submitReview
);

module.exports = router; 