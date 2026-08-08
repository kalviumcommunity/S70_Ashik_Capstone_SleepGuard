const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['Student', 'Parent'], required: true },
  parentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // For students, link to parent
  bedtime: { type: String, default: '22:00' }, // HH:mm format
  wakeTime: { type: String, default: '06:00' },
  otp: { type: String }, // For 2FA
  otpExpires: { type: Date }
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
