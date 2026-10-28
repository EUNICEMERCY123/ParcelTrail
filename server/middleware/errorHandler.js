// Express error handling middleware (Module 6)

function notFoundHandler(req, res, next) {
  res.status(404).json({
    success: false,
    message: `Resource not found: ${req.method} ${req.originalUrl}`
  });
}

function errorHandler(err, req, res, next) {
  const statusCode = err.status || err.statusCode || 500;
  console.error(`[Error] ${statusCode} - ${err.message}`);
  res.status(statusCode).json({
    success: false,
    message: err.message || 'Internal Server Error'
  });
}

module.exports = { notFoundHandler, errorHandler };
