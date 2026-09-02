const express = require('express');
const router = express.Router();
const SleepSession = require('../models/SleepSession');
const User = require('../models/User');
const { protect } = require('../middleware/authMiddleware');

router.get('/insights', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);
    let targetUserId = req.user.userId;

    // If Parent, look for their student or a demo student
    if (user && user.role === 'Parent') {
      const student = await User.findOne({ role: 'Student' });
      if (student) targetUserId = student._id;
    }

    const sessions = await SleepSession.find({ userId: targetUserId }).sort({ startTime: -1 });
    const studentUser = targetUserId === req.user.userId ? user : await User.findById(targetUserId);
    
    // Generate 7-day weekly trend
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const now = new Date();
    const weeklyTrend = [];

    for (let i = 6; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const dayName = days[d.getDay()];
      const dateStr = d.toISOString().slice(0, 10);
      
      const daySessions = sessions.filter(s => new Date(s.startTime).toISOString().slice(0, 10) === dateStr);
      let dayMins = 0;
      let eduMins = 0;
      let nonEduMins = 0;

      daySessions.forEach(s => {
        dayMins += s.totalScreenTime || 0;
        (s.appsUsed || []).forEach(a => {
          if (a.category === 'Educational') eduMins += a.durationMinutes || 0;
          else nonEduMins += a.durationMinutes || 0;
        });
      });

      weeklyTrend.push({
        day: dayName,
        date: dateStr,
        screenTime: dayMins,
        eduMins,
        nonEduMins
      });
    }

    if (sessions.length === 0) {
      return res.json({
        totalSessions: 0,
        averageScreenTime: 0,
        topApps: [],
        weeklyTrend,
        adherenceRate: 100,
        aiSuggestion: "Not enough data yet. Start tracking your sleep sessions to receive AI insights!"
      });
    }

    // Aggregate data
    let totalScreenTime = 0;
    const appUsage = {};
    let onTimeCount = 0;

    sessions.forEach(session => {
      totalScreenTime += session.totalScreenTime;
      if (session.totalScreenTime <= (studentUser?.screenTimeLimit || 45)) {
        onTimeCount++;
      }
      (session.appsUsed || []).forEach(app => {
        if (!appUsage[app.appName]) {
          appUsage[app.appName] = { duration: 0, category: app.category || 'Other' };
        }
        appUsage[app.appName].duration += app.durationMinutes || 0;
      });
    });

    const averageScreenTime = Math.round(totalScreenTime / sessions.length);
    const adherenceRate = Math.round((onTimeCount / sessions.length) * 100);
    
    // Sort top apps
    const topApps = Object.keys(appUsage).map(appName => ({
      name: appName,
      duration: appUsage[appName].duration,
      category: appUsage[appName].category
    })).sort((a, b) => b.duration - a.duration).slice(0, 4);

    // Dynamic AI Suggestion based on deep metrics
    let aiSuggestion = "";
    const targetBedtime = studentUser?.bedtime || '22:00';
    if (averageScreenTime > 60) {
      aiSuggestion = `AI Analysis: Late-night phone usage averages ${averageScreenTime} mins past your ${targetBedtime} bedtime. `;
      if (topApps.length > 0 && topApps[0].category !== 'Educational') {
        aiSuggestion += `Late night activity on ${topApps[0].name} (${topApps[0].duration}m) is delaying melatonin release. We recommend enabling App Lock 30 mins before bed.`;
      }
    } else if (averageScreenTime > 30) {
      aiSuggestion = `AI Analysis: Moderate evening screen time (${averageScreenTime} mins). You're on track! Shifting the final 15 minutes to reading or audiobooks will boost your REM quality.`;
    } else {
      aiSuggestion = `AI Analysis: Fantastic sleep routine! Minimal late-night screen time (${averageScreenTime} mins) with ${adherenceRate}% bedtime goal adherence. Keep this up!`;
    }

    res.json({
      totalSessions: sessions.length,
      averageScreenTime,
      topApps,
      weeklyTrend,
      adherenceRate,
      aiSuggestion,
      monitoredStudentName: studentUser?.name || 'Alex Jenkins'
    });
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
});

module.exports = router;
