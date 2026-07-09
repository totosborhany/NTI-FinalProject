import { Server } from 'socket.io';

export const initializeSockets = (server) => {
  const io = new Server(server, {
    cors: {
      origin: '*',
    },
  });

  return io;
};
