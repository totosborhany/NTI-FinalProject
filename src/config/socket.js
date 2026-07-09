import { Server } from 'socket.io';
import { logger } from '../utils/logger.js';

const projectRooms = new Set();

export const initializeSocket = (server) => {
  const io = new Server(server, {
    cors: {
      origin: process.env.SOCKET_CORS_ORIGIN,
      methods: ['GET', 'POST'],
    },
  });

  io.on('connection', (socket) => {
    logger.info(`Socket connected: ${socket.id}`);

    socket.on('joinProject', (projectId) => {
      socket.join(`project:${projectId}`);
      projectRooms.add(`project:${projectId}`);
      logger.info(`Socket ${socket.id} joined project room ${projectId}`);
    });

    socket.on('leaveProject', (projectId) => {
      socket.leave(`project:${projectId}`);
      logger.info(`Socket ${socket.id} left project room ${projectId}`);
    });

    socket.on('chatMessage', (payload) => {
      logger.info(`Chat message received for project ${payload?.projectId}`);
      socket.to(`project:${payload?.projectId}`).emit('chatMessage', payload);
    });

    socket.on('taskUpdated', (payload) => {
      logger.info(`Task update received for project ${payload?.projectId}`);
      socket.to(`project:${payload?.projectId}`).emit('taskUpdated', payload);
    });

    socket.on('notification', (payload) => {
      logger.info(`Notification received for project ${payload?.projectId}`);
      socket.to(`project:${payload?.projectId}`).emit('notification', payload);
    });

    socket.on('disconnect', () => {
      logger.info(`Socket disconnected: ${socket.id}`);
    });
  });

  return io;
};

export { projectRooms };
