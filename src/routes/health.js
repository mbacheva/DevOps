const express = require('express');
const router = express.Router();
const { sequelize } = require('../models');

// Liveness probe - checks if application is running
router.get('/live', (req, res) => {
  res.status(200).json({
    status: 'UP',
    timestamp: new Date().toISOString()
  });
});

// Readiness probe - checks if application is ready to serve traffic
router.get('/ready', async (req, res) => {
  try {
    // Check database connection
    await sequelize.authenticate();
    
    res.status(200).json({
      status: 'READY',
      database: 'connected',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(503).json({
      status: 'NOT_READY',
      database: 'disconnected',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

module.exports = router;
