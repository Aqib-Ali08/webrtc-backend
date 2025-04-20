import { Server } from 'socket.io';
import dotenv from 'dotenv';

dotenv.config();
let io;

export const initSocket = (server) => {
    io = new Server(server, {
        cors: {
            origin: process.env.CLIENT_URL, // Adjust for production
            methods: ['GET', 'POST'],
        },
    });

    io.on('connection', (socket) => {
        console.log('🟢 New client connected:', socket.id);

        // Join a room (e.g., for meeting or chat)
        socket.on('join-room', ({ roomId, userId }) => {
            socket.join(roomId);
            socket.to(roomId).emit('user-joined', userId);
            console.log(`User ${userId} joined room ${roomId}`);
        });

        // Basic chat event
        socket.on('send-message', ({ roomId, message }) => {
            socket.to(roomId).emit('receive-message', message);
        });

        // WebRTC signaling (future use)
        socket.on('offer', (data) => {
            socket.to(data.roomId).emit('offer', data.offer);
        });

        socket.on('answer', (data) => {
            socket.to(data.roomId).emit('answer', data.answer);
        });

        socket.on('ice-candidate', (data) => {
            socket.to(data.roomId).emit('ice-candidate', data.candidate);
        });

        socket.on('disconnect', () => {
            console.log('🔴 Client disconnected:', socket.id);
        });
    });

    return io;
};

export const getIO = () => {
    if (!io) throw new Error('Socket.io not initialized');
    return io;
};
