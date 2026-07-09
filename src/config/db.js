import mongoose from 'mongoose';
import { logger } from '../utils/logger.js';
//TODO conncet with the main ISP to connect to the database 
export const connectDatabase = async () => {
  if (mongoose.connection.readyState === 1) {
    logger.info('MongoDB connection already established');
    return;
  }

  try {
    await mongoose.connect(process.env.MONGO_URI, {
      autoIndex: true,
    });

    logger.info('MongoDB connected successfully');
  } catch (error) {
    logger.error('MongoDB connection failed', error);
    throw error;
  }
};

export const disconnectDatabase = async () => {
  if (mongoose.connection.readyState === 0) {
    return;
  }

  await mongoose.disconnect();
  logger.info('MongoDB disconnected successfully');
};