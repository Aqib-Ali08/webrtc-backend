import SocketEvents from '../constants/socketEvent.js';
import { registerFriendSocketHandlers } from './friend.socket.js';
import {
  addUserSocket,
  removeUserSocket,
  getConnectedUsers,
  getUserSockets
} from '../utils/connectedUsers.js';
import { getRelevantUsersForPresence } from '../utils/presenceUtils.js';
import { registerChatSocketHandlers } from './chat.socket.js';

export const registerSocketEvents = async (socket, io) => {
  const userId = socket.user?.id;
  const username = socket.user?.username;

  if (!userId) {
    console.warn("⚠️ Socket connection without user ID");
    return;
  }

  // Add to connected users and check if first connection
  const wasOffline = addUserSocket(userId, socket.id);

  // Get relevant users (friends, shared chats, etc.)
  const relevantUsers = await getRelevantUsersForPresence(userId);

  // 1️⃣ Send initial online users list to this user
  const connectedUsersMap = getConnectedUsers(); // Map<userId, Set<socketIds>>
  
  const alreadyOnline = relevantUsers.filter(uid => connectedUsersMap.has(uid));

  if (alreadyOnline.length > 0) {
    io.to(socket.id).emit(SocketEvents.SERVER_PRESENCE_INIT, {
      online_users: alreadyOnline
    });
  }

  // 2️⃣ If this is first connection, notify relevant users you are online
  if (wasOffline) {
    relevantUsers.forEach((uid) => {
      const sockets = getUserSockets(uid);
      sockets.forEach((socketId) => {
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

  // 3️⃣ Handle disconnect
  socket.on(SocketEvents.DISCONNECT, async () => {
    const isNowOffline = removeUserSocket(userId, socket.id);

    if (isNowOffline) {
      const relevantUsers = await getRelevantUsersForPresence(userId);
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
