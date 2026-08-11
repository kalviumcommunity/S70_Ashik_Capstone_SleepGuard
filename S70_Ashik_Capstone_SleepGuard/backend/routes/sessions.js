const express = require('express');
const router = express.Router();
const SleepSession = require('../models/SleepSession');

// CREATE
router.post('/session', async (req, res) => {
  try {
    const session = await SleepSession.create({ 
      userId: req.body.userId, 
      startTime: req.body.startTime, 
      endTime: req.body.endTime 
    });
    res.status(201).json(session);
  } catch (err) {
    res.status(500).json({error:'Server Error', details: err.message})
  }
});

// READ
router.get('/session/:id', async (req, res) => {
  try {
    const session = await SleepSession.findById(req.params.id);
    if (!session) return res.status(404).json({error: 'Not Found'});
    res.json(session);
  } catch (err) {
    res.status(500).json({error:'Server Error', details: err.message})
  }
});

module.exports = router;
