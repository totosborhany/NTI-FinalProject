import http from 'http';
import app from './app.js';
import { connectDatabase, disconnectDatabase } from './db.js';
import { logger } from '../utils/logger.js';

const startServer = async () => {
  try {
    await connectDatabase();

    const server = http.createServer(app);

    server.listen(process.env.PORT, () => {
      logger.info(`Server is running on port ${process.env.PORT}`);
    });

    const shutdown = async (signal) => {
      logger.info(`${signal} received. Shutting down gracefully...`);
      server.close();
      await disconnectDatabase();
      process.exit(0);
    };

    process.on('SIGINT', () => {
      void shutdown('SIGINT');
    });

    process.on('SIGTERM', () => {
      void shutdown('SIGTERM');
    });
  } catch (error) {
    logger.error('Failed to start server', error);
    process.exit(1);
  }
};

void startServer();