const express = require('express');
const router = express.Router();
const SleepSession = require('../models/SleepSession');
const User = require('../models/User');
const { protect } = require('../middleware/authMiddleware');

router.get('/insights', protect, async (req, res) => {
  try {
    const sessions = await SleepSession.find({ userId: req.user.userId });
    const user = await User.findById(req.user.userId);
    
    if (sessions.length === 0) {
      return res.json({
        totalSessions: 0,
        averageScreenTime: 0,
        topApps: [],
        aiSuggestion: "Not enough data yet. Start tracking your sleep sessions to receive AI insights!"
      });
    }

    // Aggregate data
    let totalScreenTime = 0;
    const appUsage = {};

    sessions.forEach(session => {
      totalScreenTime += session.totalScreenTime;
      session.appsUsed.forEach(app => {
        if (!appUsage[app.appName]) {
          appUsage[app.appName] = 0;
        }
        appUsage[app.appName] += app.durationMinutes;
      });
    });

    const averageScreenTime = Math.round(totalScreenTime / sessions.length);
    
    // Sort top apps
    const topApps = Object.keys(appUsage).map(appName => ({
      name: appName,
      duration: appUsage[appName]
    })).sort((a, b) => b.duration - a.duration).slice(0, 3);

    // Generate Mock AI Suggestion based on data
    let aiSuggestion = "";
    if (averageScreenTime > 60) {
      aiSuggestion = `AI Analysis: Your average late-night screen time is quite high (${averageScreenTime} mins). `;
      if (topApps.length > 0) {
         aiSuggestion += `Cutting down on ${topApps[0].name} before your ${user.bedtime} bedtime will significantly improve your REM sleep cycles. `;
      }
    } else {
      aiSuggestion = `AI Analysis: You have healthy screen time habits (${averageScreenTime} mins on average). Keep maintaining your ${user.bedtime} bedtime routine for optimal rest!`;
    }

    res.json({
      totalSessions: sessions.length,
      averageScreenTime,
      topApps,
      aiSuggestion
    });
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
});

module.exports = router;
