const express = require('express');
const router = express.Router();
const statusController = require('../controllers/status.controller');

/**
 * @swagger
 * /api/v1/status:
 *   get:
 *     summary: Check API and database health
 *     tags: [Status]
 *     responses:
 *       200:
 *         description: API and database are healthy
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: ok
 *                 database:
 *                   type: string
 *                   example: connected
 *       500:
 *         description: Server error
 */
router.get('/', statusController.checkHealth);

module.exports = router; 