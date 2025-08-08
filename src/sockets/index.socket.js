import SocketEvents from '../constants/socketEvent.js';
import { registerFriendSocketHandlers } from './friend.socket.js';
import {
  addUserSocket,
  removeUserSocket,
  getConnectedUsers
} from '../utils/connectedUsers.js';

export const registerSocketEvents = (socket, io) => {
  const userId = socket.user?.id;
  const username = socket.user?.username;

  if (!userId) {
    console.warn("⚠️ Socket connection without user ID");
    return;
  }

  // Add to connected users
  addUserSocket(userId, socket.id);
  console.log(`✅ Connected: ${username} (${userId}) | Socket: ${socket.id}`);
  console.log("👥 Connected users:", Object.fromEntries(
    [...getConnectedUsers()].map(([uid, sockets]) => [uid, [...sockets]])
  ));

  registerFriendSocketHandlers(socket, io);

  socket.on(SocketEvents.DISCONNECT, () => {
    removeUserSocket(userId, socket.id);
    console.log(`❌ Disconnected: ${username} (${userId}) | Socket: ${socket.id}`);
    console.log("👥 Connected users:", Object.fromEntries(
      [...getConnectedUsers()].map(([uid, sockets]) => [uid, [...sockets]])
    ));

    // You can emit presence updates to others here
    // io.emit(SocketEvents.PRESENCE_OFFLINE, { userId });
  });
};
