import SocketEvents from "../constants/socketEvent.js";
import { getConnectedUsers } from "../utils/connectedUsers.js";

export const registerFriendSocketHandlers = (socket, io) => {
  const userId = socket.user.id;
  // ✅ Friend request sent
  socket.on(SocketEvents.FRIEND_REQUEST_SENT, ({ toUserId, message }) => {
    console.log(`📨 Friend request sent from ${userId} to ${toUserId}`);

    const recipientSockets = getConnectedUsers().get(toUserId);

    if (recipientSockets) {
      recipientSockets.forEach((socketId) => {
        io.to(socketId).emit(SocketEvents.NOTIFY, {
          type: "FRIEND_REQUEST_SENT",
          fromUserId: socket.user,
          message,
          createdAt: new Date().toISOString(),
        });
      });
    } else {
      console.log(`❌ User ${toUserId} is not online. Can't deliver friend request now.`);
    }
  });


  // ✅ Friend request accepted
  socket.on(SocketEvents.FRIEND_REQUEST_ACCEPTED, ({ toUserId, message }) => {
    console.log(`${userId} accepted friend request of ${toUserId}`);

    const recipientSockets = getConnectedUsers().get(toUserId);
     if (recipientSockets) {
      recipientSockets.forEach((socketId) => {
        io.to(socketId).emit(SocketEvents.NOTIFY, {
          type: "FRIEND_REQUEST_ACCEPTED",
          fromUserId: socket.user,
          message,
          createdAt: new Date().toISOString(),
        });
      });
    } else {
      console.log(`❌ User ${toUserId} is not online.`);
    }
  });
};
