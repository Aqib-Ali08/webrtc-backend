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

    // 🔐 Middleware for authentication
    io.use((socket, next) => {
        const token = socket.handshake.auth.token;

        if (!token) {
            return next(new Error('Authentication error: token missing'));
        }

        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY)
            socket.user = decoded;
            next();
        } catch (err) {
            console.error('Invalid token:', err.message);
            return next(new Error('Authentication error: invalid token'));
        }
    });

    // On connection
    io.on('connection', (socket) => {
        registerSocketEvents(socket);
    });

    return io;
};

export const getIO = () => {
    if (!io) {
        throw new Error('Socket.io not initialized!');
    }
    return io;
};
