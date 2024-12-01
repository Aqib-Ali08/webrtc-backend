import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import http from 'http'; // Import HTTP to create a server
import { Server } from 'socket.io'; // Import Socket.IO
import bodyParser from 'body-parser';
import authRoutes from './routes/auth.js';

const { connect, connection } = mongoose;

const app = express();
const server = http.createServer(app); // Create HTTP server
const io = new Server(server, {
  cors: {
    origin: "https://web-rtc-video-app-f6nm.vercel.app/", // Allow your frontend origin
    methods: ["GET", "POST"],
  },
});

// Configure CORS for Express
app.use(cors({
  origin: "https://web-rtc-video-app-f6nm.vercel.app/", // Allow your frontend origin
}));
app.use(bodyParser.json());

// MongoDB Connection
connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
const db = connection;
db.on('error', console.error.bind(console, 'Connection error:'));
db.once('open', () => console.log('Connected to MongoDB'));

// Routes
app.use('/api/auth', authRoutes);

// WebRTC Signaling with Socket.IO
const rooms = {}; // Object to store active rooms and their users

io.on('connection', (socket) => {
  console.log('A user connected:', socket.id);

  // Create a new room
  socket.on('create-room', (roomId) => {
    if (!rooms[roomId]) {
      rooms[roomId] = [];
      console.log(`Room ${roomId} created.`);
    }
    socket.join(roomId);
    rooms[roomId].push(socket.id);
    io.to(socket.id).emit('room-created', { roomId });
  });

  // Join an existing room
  socket.on('join-room', (roomId) => {
    if (rooms[roomId]) {
      socket.join(roomId);
      rooms[roomId].push(socket.id);
      console.log(`User ${socket.id} joined room ${roomId}.`);

      // Notify all users in the room about the new user
      socket.to(roomId).emit('user-connected', socket.id);

      io.to(socket.id).emit('room-joined', { roomId });
    } else {
      io.to(socket.id).emit('error', { message: 'Room does not exist.' });
    }
  });

  // Forward WebRTC offers
  socket.on('offer', ({ to, offer }) => {
    socket.to(to).emit('offer', { from: socket.id, offer });
  });

  // Forward WebRTC answers
  socket.on('answer', ({ to, answer }) => {
    socket.to(to).emit('answer', { from: socket.id, answer });
  });

  // Forward ICE candidates
  socket.on('ice-candidate', ({ to, candidate }) => {
    socket.to(to).emit('ice-candidate', { from: socket.id, candidate });
  });

  // Handle user leaving the room
  socket.on('leave-room', (roomId) => {
    socket.leave(roomId);
    if (rooms[roomId]) {
      rooms[roomId] = rooms[roomId].filter(id => id !== socket.id);
      socket.to(roomId).emit('user-disconnected', socket.id); // Notify other users

      if (rooms[roomId].length === 0) {
        delete rooms[roomId]; // Delete the room if it's empty
        console.log(`Room ${roomId} deleted.`);
      }
    }
  });

  // Handle disconnection
  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
    for (const roomId in rooms) {
      rooms[roomId] = rooms[roomId].filter(id => id !== socket.id);
      socket.to(roomId).emit('user-disconnected', socket.id); // Notify other users

      if (rooms[roomId].length === 0) {
        delete rooms[roomId];
        console.log(`Room ${roomId} deleted.`);
      }
    }
  });
});


const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));