const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes/auth.routes');
const projectRoutes = require('./routes/project.routes');
const taskRoutes = require('./routes/task.routes');
const { errorHandler } = require('./middleware/errorHandler');
const db = require('./config/db');

const app = express();

// Enable CORS
const corsOrigin = process.env.CORS_ORIGIN || 'http://localhost:5173';
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, curl, Postman)
      if (!origin) return callback(null, true);
      // In development, allow localhost origins
      if (origin.startsWith('http://localhost') || origin === corsOrigin) {
        return callback(null, true);
      }
      return callback(null, true); // Dev fallback
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
  })
);

// Body parser
app.use(express.json());

// API Health Check
app.get('/api/health', (req, res) => {
  const isNeonConfigured = db.isDatabaseConfigured();
  res.status(200).json({
    success: true,
    message: 'TaskFlow API is running smoothly',
    storage: isNeonConfigured ? 'neon-postgresql' : 'in-memory-fallback',
    databaseConnected: isNeonConfigured,
    timestamp: new Date().toISOString()
  });
});

// Mount Routes
app.use('/api/auth', authRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/tasks', taskRoutes);

// Catch-all 404 for undefined API routes
app.use('/api/*', (req, res) => {
  res.status(404).json({
    success: false,
    message: `API endpoint not found: ${req.method} ${req.originalUrl}`,
    errors: []
  });
});

// Centralized Error Handler
app.use(errorHandler);

module.exports = app;
