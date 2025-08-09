import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';
import { registerSocketEvents } from '../sockets/index.socket.js';

let io = null;

export const setupSocketServer = (server) => {
  io = new Server(server, {
    cors: {
      origin: process.env.SOCKET_CLIENT_URL,
      methods: ['GET', 'POST'],
    },
  });

  // Auth middleware
  io.use((socket, next) => {
    const token = socket.handshake.auth.token || socket.handshake.query.token;
    if (!token) return next(new Error("Token missing"));

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
      socket.user = decoded;
      next();
    } catch (err) {
      return next(new Error("Invalid token"));
    }
  });


  // Only ONE listener now!
  io.on('connection', (socket) => {
    registerSocketEvents(socket, io); // ✅ Correct usage
  });

  return io;
};
