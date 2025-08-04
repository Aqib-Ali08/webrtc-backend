import SocketEvents from "../constants/socketEvent.js";

export const registerFriendSocketHandlers = (socket, io) => {
  const userId = socket.user.id;

  socket.on(SocketEvents.FRIEND_REQUEST_SENT, ({ toUserId, message }) => {
    console.log(`Friend request sent from ${userId} to ${toUserId}`);
    io.to(toUserId).emit(SocketEvents.NOTIFY, {
      type: "FRIEND_REQUEST",
      fromUserId: socket.user,
      message,
      createdAt: new Date().toISOString(),
    });
  });



  // ✅ Friend request accepted
  socket.on(SocketEvents.FRIEND_REQUEST_ACCEPTED, ({ toUserId, message }) => {
    io.to(toUserId).emit(SocketEvents.NOTIFY, {
      type: SocketEvents.FRIEND_REQUEST_ACCEPTED,
      fromUserId: userId,
      message,
    });
  });

  // ❌ Friend request canceled
  socket.on(SocketEvents.FRIEND_REQUEST_CANCELED, ({ toUserId }) => {
    io.to(toUserId).emit(SocketEvents.NOTIFY, {
      type: SocketEvents.FRIEND_REQUEST_CANCELED,
      fromUserId: userId,
      message: "Friend request canceled",
    });
  });
};
