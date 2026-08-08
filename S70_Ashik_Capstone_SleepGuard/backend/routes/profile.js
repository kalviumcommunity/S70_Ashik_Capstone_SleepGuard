const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { protect, authorize } = require('../middleware/authMiddleware');

// Get Profile
router.get('/', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select('-password -otp -otpExpires');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
});

// Update Bedtime Settings
router.put('/bedtime', protect, async (req, res) => {
  try {
    const { bedtime, wakeTime } = req.body;
    
    // Allow student to update their own, or parent to update their child's (simplified for now)
    const user = await User.findById(req.user.userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    if (bedtime) user.bedtime = bedtime;
    if (wakeTime) user.wakeTime = wakeTime;

    const updatedUser = await user.save();
    
    res.json({
      message: 'Sleep schedule updated successfully',
      bedtime: updatedUser.bedtime,
      wakeTime: updatedUser.wakeTime
    });
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
});

module.exports = router;
