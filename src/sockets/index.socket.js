import { getIO } from '../config/socket.config.js';
import SocketEvents from '../constants/socketEvent.js';

// import handleChatSocket from './chat.socket.js';
// import handleFriendSocket from './friend.socket.js';
// import handleMeetingSocket from './meeting.socket.js';
// import handlePresenceSocket from './presence.socket.js';

// const onlineUsers = new Map();

export const registerSocketEvents = () => {
  const io = getIO();

  io.on(SocketEvents.CONNECTION, (socket) => {
    const userId = socket.user.id;
    const username = socket.user.username;
    console.log(`✅ Socket connected: ${username}`);
    // console.log(socket.user)
    // onlineUsers.set(userId, socket.id);

    // handleChatSocket(io, socket, onlineUsers);
    // handleFriendSocket(io, socket, onlineUsers);
    // handleMeetingSocket(io, socket, onlineUsers);
    // handlePresenceSocket(io, socket, onlineUsers);

    // io.emit(SocketEvents.PRESENCE_ONLINE, { userId });

    socket.on(SocketEvents.DISCONNECT, () => {
      console.log(`❌ Socket disconnected: ${userId}`);
      // onlineUsers.delete(userId);
      io.emit(SocketEvents.PRESENCE_OFFLINE, { userId });
    });
  });
};
