import { getIO } from '../config/socket.config.js';
import { registerFriendSocketHandlers } from './friend.socket.js';
import SocketEvents from '../constants/socketEvent.js';
export const registerSocketEvents = () => {
  const io = getIO();

  io.on(SocketEvents.CONNECTION, (socket) => {
    const userId = socket.user?.id;
    const username = socket.user?.username;

    if (!userId) {
      console.warn("⚠️ Socket connection without user ID");
      return;
    }

    socket.join(userId); // ✅ Now userId is defined
    console.log(`✅ Socket connected: ${username}`);

    registerFriendSocketHandlers(socket, io);

    socket.on(SocketEvents.DISCONNECT, () => {
      console.log(`❌ Socket disconnected: ${userId}`);
      io.emit(SocketEvents.PRESENCE_OFFLINE, { userId });
    });
  });
};
