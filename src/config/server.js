import http from 'http';
import app from './app.js';
import { connectDatabase, disconnectDatabase } from './db.js';
import { logger } from '../utils/logger.js';
import  redis  from "../config/redisSetup.js";

const startServer = async () => {
  try {
    await connectDatabase();

    // 1. Establish Redis connection before creating the HTTP server

if (!redis.isOpen) {
  await redis.connect();
  logger.info("Redis connected successfully via server boot");
} else {
  logger.info("Redis was already connected via setup initialization");
}

    const server = http.createServer(app);
    
    // 2. Fallback to port 8000 if process.env.PORT is missing/undefined
    const PORT = process.env.PORT || 8000;

    server.listen(PORT, () => {
      logger.info(`Server is running on port ${PORT}`);
    });

    const shutdown = async (signal) => {
      logger.info(`${signal} received. Shutting down gracefully...`);
      server.close();
      await disconnectDatabase();
      if (redis.isOpen) await redis.disconnect(); // Safely disconnect Redis
      process.exit(0);
    };

    process.on('SIGINT', () => { void shutdown('SIGINT'); });
    process.on('SIGTERM', () => { void shutdown('SIGTERM'); });

  } catch (error) {
    // 3. Force the logger to print the real error message and stack trace
    logger.error(`Failed to start server: ${error.message}`, { stack: error.stack });
    
    // 4. Only disconnect if Redis was actually open
    try {
      if (redis && redis.isOpen) {
        await redis.disconnect();
      }
    } catch (disconnectError) {
      logger.error('Failed to close redis connection on crash', disconnectError);
    }
    
    process.exit(1);
  }
};

void startServer();
