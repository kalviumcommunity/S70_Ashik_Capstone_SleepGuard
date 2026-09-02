const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['Student', 'Parent'], required: true },
  parentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // For students, link to parent
  linkedStudentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // For parents, link to student
  bedtime: { type: String, default: '22:00' }, // HH:mm format
  wakeTime: { type: String, default: '06:00' },
  screenTimeLimit: { type: Number, default: 45 }, // Screen time limit in minutes
  otp: { type: String }, // For 2FA
  otpExpires: { type: Date }
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
