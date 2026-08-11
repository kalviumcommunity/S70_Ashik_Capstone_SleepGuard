// __tests__/sessionController.test.js

const { calculateSleepDuration } = require('../controllers/sessionController');

describe('calculateSleepDuration', () => {
  test('should return 8 for 8 hour sleep', () => {
    const start = '2024-06-16T22:00:00Z';
    const end = '2024-06-17T06:00:00Z';
    expect(calculateSleepDuration(start, end)).toBe(8);
  });

  test('should return 0 for same start and end time', () => {
    const time = '2024-06-16T22:00:00Z';
    expect(calculateSleepDuration(time, time)).toBe(0);
  });

  test('should return 1.5 for 90 minutes', () => {
    const start = '2024-06-16T22:00:00Z';
    const end = '2024-06-16T23:30:00Z';
    expect(calculateSleepDuration(start, end)).toBe(1.5);
  });

  test('should handle overnight sleep correctly', () => {
    const start = '2024-06-16T23:00:00Z';
    const end = '2024-06-17T07:00:00Z';
    expect(calculateSleepDuration(start, end)).toBe(8);
  });

  test('should return negative for invalid range', () => {
    const start = '2024-06-17T06:00:00Z';
    const end = '2024-06-16T22:00:00Z';
    expect(calculateSleepDuration(start, end)).toBeLessThan(0);
  });
});
