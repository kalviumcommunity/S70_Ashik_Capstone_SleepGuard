
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

// Get all sleep sessions
router.get('/sessions', async (req, res) => {
  try {
    const sessions = await SleepSession.find(); // Assuming SleepSession is your Mongoose model
    res.json(sessions);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// POST - Create a sleep session
router.post('/sessions', async (req, res) => {
  try {
    const { userId, startTime, endTime } = req.body;

    const newSession = new SleepSession({
      userId,
      startTime,
      endTime,
    });

    await newSession.save();
    res.status(201).json(newSession);
  } catch (error) {
    res.status(500).json({ message: 'Failed to create session', error });
  }
});

// PUT - Update a sleep session by ID
router.put('/sessions/:id', async (req, res) => {
  try {
    const { startTime, endTime } = req.body;
    const updatedSession = await SleepSession.findByIdAndUpdate(
      req.params.id,
      { startTime, endTime },
      { new: true } // Return the updated document
    );

    if (!updatedSession) {
      return res.status(404).json({ message: 'Session not found' });
    }

    res.json(updatedSession);
  } catch (err) {
    res.status(500).json({ message: 'Failed to update session', error: err });
  }
});
