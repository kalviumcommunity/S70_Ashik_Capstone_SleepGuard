// controllers/sessionController.js

function calculateSleepDuration(start, end) {
  const duration = new Date(end) - new Date(start);
  return duration / (1000 * 60 * 60); // milliseconds to hours
}

module.exports = { calculateSleepDuration };
