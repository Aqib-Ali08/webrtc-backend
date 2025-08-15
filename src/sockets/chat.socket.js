import SocketEvents from "../constants/socketEvent.js";
import Conversation from "../models/conversation.model.js";

export const registerFriendSocketHandlers = (socket, io) => {
  const userId = socket.user.id;

  /**
   * Join a conversation room silently
   */
  socket.on(SocketEvents.CLIENT_CHAT_JOIN, async ({ conversationId }) => {
    if (!conversationId) return;

    try {
      // Validate if user is part of conversation
      const isMember = await Conversation.exists({ _id: conversationId, participants: userId });
      if (!isMember) {
        socket.emit(SocketEvents.SERVER_ERROR, { message: 'Not authorized for this conversation.' });
        return;
      }

      // Join socket.io room silently
      socket.join(`conversation_${conversationId}`);
      console.log(`✅ User ${userId} joined conversation ${conversationId}`);

    } catch (err) {
      console.error('Error joining conversation:', err);
      socket.emit(SocketEvents.SERVER_ERROR, { message: 'Failed to join conversation.' });
    }
  });

  /**
   * Leave a conversation room silently
   */
  socket.on(SocketEvents.CLIENT_CHAT_LEAVE, ({ conversationId }) => {
    if (!conversationId) return;

    // Leave room silently
    socket.leave(`conversation_${conversationId}`);
    console.log(`❌ User ${userId} left conversation ${conversationId}`);
  });
};
