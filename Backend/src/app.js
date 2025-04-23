require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');
const db = require('./models');

// Import routes
const authRoutes = require('./routes/auth.routes');
const topicRoutes = require('./routes/topic.routes');
const quizRoutes = require('./routes/quiz.routes');
const noteRoutes = require('./routes/note.routes');
const calendarRoutes = require('./routes/calendar.routes');
const tutoringRoutes = require('./routes/tutoring.routes');
const audioRoutes = require('./routes/audio.routes');
const aiAssistantRoutes = require('./routes/ai-assistant.routes');

const app = express();

// Middleware
app.use(cors());
app.use(helmet());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Swagger configuration
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'UniHub API Documentation',
      version: '1.0.0',
      description: 'API documentation for UniHub - Educational Platform',
    },
    servers: [
      {
        url: 'http://localhost:3000',
        description: 'Development server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
  },
  apis: ['./src/routes/*.js'], // Path to the API routes
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);

// Swagger UI route
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Health check endpoint (no auth required)
app.get('/api/status', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date() });
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/topics', topicRoutes);
app.use('/api/quizzes', quizRoutes);
app.use('/api/notes', noteRoutes);
app.use('/api/calendar', calendarRoutes);
app.use('/api/tutoring', tutoringRoutes);
app.use('/api/audio', audioRoutes);
app.use('/api/ai-assistant', aiAssistantRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

const PORT = process.env.PORT || 3000;

// Only start the server if we're not in a test environment
if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    console.log(`Swagger documentation available at http://localhost:${PORT}/api-docs`);
  });
}

// Export the app for testing
module.exports = app; 