const express = require('express');
const router = express.Router();
const SleepSession = require('../models/SleepSession');
const Notification = require('../models/Notification');
const User = require('../models/User');
const { protect } = require('../middleware/authMiddleware');

// Get all usage sessions for the logged-in user
router.get('/', protect, async (req, res) => {
  try {
    const sessions = await SleepSession.find({ userId: req.user.userId }).sort({ startTime: -1 });
    res.json(sessions);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
});

// Record a new usage session (Simulating data from mobile app)
router.post('/record', protect, async (req, res) => {
  try {
    const { startTime, endTime, appsUsed, totalScreenTime } = req.body;
    
    const session = await SleepSession.create({
      userId: req.user.userId,
      startTime,
      endTime,
      appsUsed,
      totalScreenTime
    });

    // Check for non-educational apps to trigger an alert
    const nonEduApps = appsUsed.filter(app => app.category !== 'Educational');
    if (nonEduApps.length > 0) {
      const user = await User.findById(req.user.userId);
      // In a real scenario, this goes to user.parentId. For demo purposes, we send it to the user themselves so they can see it in the dashboard.
      const targetUserId = user.parentId || req.user.userId; 
      
      const appNames = nonEduApps.map(a => a.appName).join(', ');
      const timeStr = new Date(startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      
      const notification = await Notification.create({
        userId: targetUserId,
        studentId: user._id,
        title: 'Late Night Phone Usage Detected',
        message: `${user.name} is using ${appNames} at ${timeStr}.`
      });
      
      console.log(`[MOCK PUSH NOTIFICATION sent to Parent] ${notification.message}`);
    }

    res.status(201).json({ message: 'Usage data recorded successfully', session });
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
});

module.exports = router;
