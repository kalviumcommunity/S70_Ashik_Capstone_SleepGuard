const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

const connectDB = async () => {
  try {
    // Try to connect to the local MongoDB instance first
    console.log('Attempting to connect to local MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI, { serverSelectionTimeoutMS: 2000 });
    console.log('Database connected successfully (Local/Atlas)');
  } catch (err) {
    console.log('Local MongoDB not found. Starting In-Memory Database instead...');
    
    // Fallback: Start an in-memory MongoDB server
    try {
      const mongoServer = await MongoMemoryServer.create();
      const mongoUri = mongoServer.getUri();
      
      await mongoose.connect(mongoUri);
      console.log('In-Memory Database connected successfully!');
      console.log(`(Note: Data will be lost when the server restarts since this is an in-memory DB)`);
    } catch (memErr) {
      console.error('Failed to start In-Memory Database:', memErr);
      process.exit(1);
    }
  }
};

module.exports = connectDB;
