import SocketEvents from '../constants/socketEvent.js';

export const registerMeetingSocketHandlers = (socket, io) => {
  const userId = socket.user?.id;
  
  // User joins a meeting room
  socket.on(SocketEvents.CLIENT_MEETING_JOIN, ({ roomId }) => {
    if (!roomId) return;
    
    // Join the socket to the room
    const roomName = `meeting_${roomId}`;
    socket.join(roomName);
    console.log(`👤 User ${userId} joined meeting room: ${roomName}`);
    
    // Notify others in the room that a new user joined
    socket.to(roomName).emit(SocketEvents.MEETING_JOIN, {
      userId,
      socketId: socket.id,
    });
  });

  // Relay WebRTC signals (offer, answer, ice candidate)
  socket.on(SocketEvents.CLIENT_MEETING_SIGNAL, ({ targetId, signal, roomId }) => {
    // Relays the signal to the specific target socket
    io.to(targetId).emit(SocketEvents.MEETING_SIGNAL, {
      userId, // Sender's userId
      senderSocketId: socket.id, // Sender's socket ID
      signal, // The WebRTC data
      roomId,
    });
  });

  // User explicitly leaves the meeting room
  socket.on(SocketEvents.CLIENT_MEETING_LEAVE, ({ roomId }) => {
    if (!roomId) return;
    const roomName = `meeting_${roomId}`;
    socket.leave(roomName);
    
    // Notify others
    socket.to(roomName).emit(SocketEvents.MEETING_LEAVE, {
      userId,
      socketId: socket.id,
    });
    console.log(`👤 User ${userId} left meeting room: ${roomName}`);
  });

  // Handle sudden disconnects to notify meetings
  socket.on("disconnecting", () => {
    const rooms = Array.from(socket.rooms);
    rooms.forEach((roomName) => {
      if (roomName.startsWith("meeting_")) {
        socket.to(roomName).emit(SocketEvents.MEETING_LEAVE, {
          userId,
          socketId: socket.id,
        });
      }
    });
  });
};
