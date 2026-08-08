const mongoose = require('mongoose');

const sleepSessionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  startTime: {
    type: Date,
    required: true
  },
  endTime: {
    type: Date,
    required: true
  },
  appsUsed: [{
    appName: String,
    durationMinutes: Number,
    category: {
      type: String,
      enum: ['Educational', 'Social Media', 'Games', 'Other'],
      default: 'Other'
    }
  }],
  totalScreenTime: {
    type: Number,
    default: 0
  }
}, { timestamps: true });

module.exports = mongoose.model('SleepSession', sleepSessionSchema);
