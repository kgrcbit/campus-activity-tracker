const express = require('express');
const router = express.Router();
// 1. Import the real model
const ActivityTemplate = require('../models/activityTemplate.model');

// --- Get All Templates Route (Now fetches from DB) ---
// GET /api/templates
router.get('/', async (req, res) => {
  try {
    // 2. Find all templates in the database
    const templates = await ActivityTemplate.find({});
    
    // 3. Send the real data
    res.json(templates);

  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;