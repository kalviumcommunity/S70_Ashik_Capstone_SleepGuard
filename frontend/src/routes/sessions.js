
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
    res.json(session);
  } catch (err) {
    res.status(500).json({error:'Server Error'})
  }
});

// READ
router.get('/session/:id', async (req, res) => {
  try {
    const session = await SleepSession.findById(req.params.id);
    res.json(session);
  } catch (err) {
    res.status(500).json({error:'Server Error'})
  }
});

module.exports = router;
