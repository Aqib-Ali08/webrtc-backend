import SocketEvents from '../constants/socketEvent.js';
import { registerFriendSocketHandlers } from './friend.socket.js';
import {
  addUserSocket,
  removeUserSocket,
  getConnectedUsers,
  getUserSockets
} from '../utils/connectedUsers.js';

// Example helper to get relevant users (friends or shared chats)
import { getRelevantUsersForPresence } from '../utils/presenceUtils.js';
import { registerChatSocketHandlers } from './chat.socket.js';

export const registerSocketEvents = (socket, io) => {
  const userId = socket.user?.id;
  const username = socket.user?.username;

  if (!userId) {
    console.warn("⚠️ Socket connection without user ID");
    return;
  }

  // Add to connected users and check if first connection
  const wasOffline = addUserSocket(userId, socket.id);

  if (false) {
    // First connection → notify relevant users only
    const relevantUsers = getRelevantUsersForPresence(userId); // array of userIds

    (relevantUsers || []).forEach((uid) => {
      getUserSockets(uid).forEach((socketId) => {
        io.to(socketId).emit(SocketEvents.SERVER_USER_ONLINE, {
          user_id: userId,
          last_seen: null
        });
      });
    });
  }

  console.log(`✅ Connected: ${username} (${userId}) | Socket: ${socket.id}`);
  console.log("👥 Connected users:", Object.fromEntries(
    [...getConnectedUsers()].map(([uid, sockets]) => [uid, [...sockets]])
  ));

  registerFriendSocketHandlers(socket, io);
  registerChatSocketHandlers(socket, io);

  socket.on(SocketEvents.DISCONNECT, () => {
    const isNowOffline = removeUserSocket(userId, socket.id);

    if (isNowOffline) {
      // Last socket disconnected → notify relevant users only
      const relevantUsers = getRelevantUsersForPresence(userId);

      relevantUsers.forEach((uid) => {
        getUserSockets(uid).forEach((socketId) => {
          io.to(socketId).emit(SocketEvents.SERVER_USER_OFFLINE, {
            user_id: userId,
            last_seen: new Date().toISOString()
          });
        });
      });
    }

    console.log(`❌ Disconnected: ${username} (${userId}) | Socket: ${socket.id}`);
    console.log("👥 Connected users:", Object.fromEntries(
      [...getConnectedUsers()].map(([uid, sockets]) => [uid, [...sockets]])
    ));
  });
};
