/**
 * Centralized error handling middleware
 */
const errorHandler = (err, req, res, next) => {
  // Check if headers already sent
  if (res.headersSent) {
    return next(err);
  }

  const statusCode = err.statusCode || (res.statusCode !== 200 ? res.statusCode : 500);
  const message = err.message || 'An unexpected error occurred on the server.';
  const errors = err.errors || [];

  console.error(`[Error] ${req.method} ${req.originalUrl}:`, err);

  res.status(statusCode).json({
    success: false,
    message,
    errors
  });
};

module.exports = {
  errorHandler
};
