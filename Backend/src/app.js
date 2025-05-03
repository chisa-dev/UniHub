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
const statusRoutes = require('./routes/status.routes');
const statisticsRoutes = require('./routes/statistics.routes');
const materialRoutes = require('./routes/material.routes');
const ragRoutes = require('./routes/rag.routes');

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
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        imgSrc: ["'self'", "data:"]
      }
    }
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from uploads folder
app.use('/materials', express.static(path.join(__dirname, '../uploads/materials')));

// Database initialization
const initializeDatabase = async () => {
  try {
    await sequelize.authenticate();
    console.log('Database connection has been established successfully.');
    
    // In development, sync tables without dropping them
    if (process.env.NODE_ENV === 'development') {
      console.log('Running in development mode - syncing database tables');
      await sequelize.sync();
      console.log('Database tables synced successfully.');
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
        url: `${process.env.API_URL }${process.env.API_PREFIX || '/api'}`,
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

// Set explicit MIME types for swagger files
app.use((req, res, next) => {
  if (req.url.endsWith('.js')) {
    res.setHeader('Content-Type', 'application/javascript');
  } else if (req.url.endsWith('.css')) {
    res.setHeader('Content-Type', 'text/css');
  }
  next();
});

// Root route - redirect to Swagger docs
app.get('/', (req, res) => {
  res.redirect('/api-docs');
});

// Swagger UI route
app.use('/api-docs', (req, res, next) => {
  // Add logging for swagger requests
  console.log(`[LOG swagger_request] ========= Serving Swagger UI: ${req.url}`);
  next();
}, swaggerUi.serve, swaggerUi.setup(swaggerSpec, { 
  explorer: true,
  customCss: '.swagger-ui .topbar { display: none }' 
}));

// Fallback route for Swagger docs in case the UI fails to load
app.get('/api-docs-simple', (req, res) => {
  res.send(`
    <html>
      <head>
        <title>UniHub API Documentation</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; }
          pre { background: #f4f4f4; padding: 10px; border-radius: 5px; }
        </style>
      </head>
      <body>
        <h1>UniHub API Documentation</h1>
        <p>Simple fallback documentation page. If you're seeing this, there might be issues with the Swagger UI.</p>
        <h2>API Specification:</h2>
        <pre>${JSON.stringify(swaggerSpec, null, 2)}</pre>
      </body>
    </html>
  `);
});

// API routes
app.use('/api/status', statusRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/topics', topicRoutes);
app.use('/api/quizzes', quizRoutes);
app.use('/api/notes', noteRoutes);
app.use('/api/calendar', calendarRoutes);


app.use('/api/statistics', statisticsRoutes);
app.use('/api/materials', materialRoutes);
app.use('/api/rag', ragRoutes);

// Specific error handler for API docs
app.use('/api-docs', (err, req, res, next) => {
  console.error('[LOG swagger_error] ========= Error serving Swagger UI:', err);
  console.error('URL:', req.url);
  console.error('Stack:', err.stack);
  
  // Attempt to continue processing
  if (!res.headersSent) {
    next(err);
  }
});

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