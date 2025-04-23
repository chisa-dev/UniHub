require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');
const { sequelize } = require('./models');
const path = require('path');

// Import routes
const authRoutes = require('./routes/auth.routes');
const topicRoutes = require('./routes/topic.routes');
const quizRoutes = require('./routes/quiz.routes');
const noteRoutes = require('./routes/note.routes');
const calendarRoutes = require('./routes/calendar.routes');
const tutoringRoutes = require('./routes/tutoring.routes');
const audioRoutes = require('./routes/audio.routes');
const aiAssistantRoutes = require('./routes/ai-assistant.routes');
const statusRoutes = require('./routes/status.routes');

const app = express();

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || '*',
  credentials: true
}));

// Configure helmet but allow Swagger UI resources
app.use(
  helmet({
    contentSecurityPolicy: false,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Database initialization
const initializeDatabase = async () => {
  try {
    await sequelize.authenticate();
    console.log('Database connection has been established successfully.');
    
    // In development, sync the database
    if (process.env.NODE_ENV === 'development') {
      // Drop all tables first
      await sequelize.query('SET FOREIGN_KEY_CHECKS = 0');
      await sequelize.sync({ force: true });
      await sequelize.query('SET FOREIGN_KEY_CHECKS = 1');
      console.log('Database tables dropped and recreated successfully.');
    }
  } catch (error) {
    console.error('Unable to connect to the database:', error);
    // Don't exit process in production as it will crash the serverless function
    if (process.env.NODE_ENV !== 'production') {
      process.exit(1);
    }
  }
};

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
        url: process.env.API_URL || (process.env.NODE_ENV === 'production' ? 'https://uni-hub-backend.vercel.app/api' : 'http://localhost:3000/api'),
        description: process.env.NODE_ENV === 'production' ? 'Production server' : 'Development server',
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
  apis: [path.join(__dirname, 'routes/*.js')],
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);

// Root route - redirect to Swagger docs
app.get('/', (req, res) => {
  res.redirect('/api-docs');
});

// Swagger UI route
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, { 
  explorer: true,
  customCss: '.swagger-ui .topbar { display: none }' 
}));

// API routes
app.use('/api/status', statusRoutes);
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
  console.error('Error:', err);
  console.error('Stack:', err.stack);
  res.status(500).json({ 
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// 404 handler
app.use((req, res) => {
  console.log('404 - Route not found:', req.method, req.url);
  res.status(404).json({ message: 'Route not found' });
});

const PORT = process.env.PORT || 3000;

// Initialize database in production without server.listen
if (process.env.NODE_ENV === 'production') {
  initializeDatabase().catch(err => console.error('Database init error:', err));
} 
// Only start the server if we're not in a test or production environment
else if (process.env.NODE_ENV !== 'test') {
  initializeDatabase().then(() => {
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
      console.log(`Swagger documentation available at http://localhost:${PORT}/api-docs`);
    });
  });
}

// Export the app for serverless functions
module.exports = app; 