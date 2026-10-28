// Express Server Entry Point (Module 6 Node.js & Express)
const express = require('express');
const { connectDB, mongoose } = require('./db');
const activityLogger = require('./middleware/activityLogger');
const { notFoundHandler, errorHandler } = require('./middleware/errorHandler');
const parcelRoutes = require('./routes/parcelRoutes');
const parcelActionRoutes = require('./routes/parcelActionRoutes');
const recordsRoutes = require('./routes/recordsRoutes');
const trackRoutes = require('./routes/trackRoutes');
const otherRoutes = require('./routes/otherRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// Connect to MongoDB
connectDB();

// Built-in body parsing middleware (Module 6)
app.use(express.json());

// Custom activity logging middleware (Module 6)
app.use(activityLogger);

// Mount API routes
app.use('/api/parcels', parcelRoutes);
app.use('/api/parcels', parcelActionRoutes);
app.use('/api/records', recordsRoutes);
app.use('/api/track', trackRoutes);
app.use('/api', otherRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  const isDbConnected = mongoose.connection.readyState === 1;
  res.json({
    status: 'ok',
    db: isDbConnected ? 'connected' : 'not connected'
  });
});

// Error handling middleware
app.use(notFoundHandler);
app.use(errorHandler);

// Start server
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`[ParcelTrail Server] Running on http://localhost:${PORT}`);
  });
}

module.exports = app;
