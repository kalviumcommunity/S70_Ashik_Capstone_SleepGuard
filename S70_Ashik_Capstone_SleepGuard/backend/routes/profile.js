const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { protect } = require('../middleware/authMiddleware');

// Get Profile
router.get('/', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select('-password -otp -otpExpires');
    if (!user) return res.status(404).json({ message: 'User not found' });
    
    // If Parent, return student schedule if linked
    if (user.role === 'Parent') {
      const student = await User.findOne({ role: 'Student' });
      if (student) {
        return res.json({
          ...user.toObject(),
          bedtime: student.bedtime || user.bedtime || '22:00',
          wakeTime: student.wakeTime || user.wakeTime || '06:00',
          screenTimeLimit: student.screenTimeLimit !== undefined ? student.screenTimeLimit : (user.screenTimeLimit || 45)
        });
      }
    }
    
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
});

// Update Bedtime Settings
router.put('/bedtime', protect, async (req, res) => {
  try {
    const { bedtime, wakeTime, screenTimeLimit } = req.body;
    
    const user = await User.findById(req.user.userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    if (bedtime) user.bedtime = bedtime;
    if (wakeTime) user.wakeTime = wakeTime;
    if (screenTimeLimit !== undefined && screenTimeLimit !== null && screenTimeLimit !== '') {
      user.screenTimeLimit = Number(screenTimeLimit);
    }

    const updatedUser = await user.save();

    // If Parent, also synchronize the student's bedtime and limit
    if (user.role === 'Parent') {
      const student = await User.findOne({ role: 'Student' });
      if (student) {
        if (bedtime) student.bedtime = bedtime;
        if (wakeTime) student.wakeTime = wakeTime;
        if (screenTimeLimit !== undefined && screenTimeLimit !== null && screenTimeLimit !== '') {
          student.screenTimeLimit = Number(screenTimeLimit);
        }
        await student.save();
      }
    }
    
    res.json({
      message: 'Sleep schedule saved successfully!',
      bedtime: updatedUser.bedtime,
      wakeTime: updatedUser.wakeTime,
      screenTimeLimit: updatedUser.screenTimeLimit
    });
  } catch (error) {
    console.error('Error saving bedtime schedule:', error);
    res.status(500).json({ message: 'Server Error saving schedule', error: error.message });
  }
});

module.exports = router;
