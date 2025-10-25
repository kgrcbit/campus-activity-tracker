const express = require('express');
const router = express.Router();
// 1. Import the real model
const ActivityTemplate = require('../models/activityTemplate.model');

// --- Get All Templates Route (Now fetches from DB) ---
// GET /api/templates
router.get('/', async (req, res) => {
  try {
    // Just send the hard-coded mock data
    res.json(mockTemplates);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;