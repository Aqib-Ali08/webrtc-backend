import SocketEvents from "../constants/socketEvent.js";
import Conversation from "../models/conversation.model.js";
import Messages from "../models/messages.model.js";

export const registerChatSocketHandlers = (socket, io) => {
  const userId = socket.user.id;

  // Join a conversation room silently
  // socket.on(SocketEvents.CLIENT_CHAT_JOIN, async ({ conversationId }) => {
  //   if (!conversationId) return;

  //   try {
  //     // Validate if user is part of conversation
  //     const isMember = await Conversation.exists({ _id: conversationId, participants: userId });
  //     if (!isMember) {
  //       socket.emit(SocketEvents.SERVER_ERROR, { message: "Not authorized for this conversation." });
  //       return;
  //     }

  //     socket.join(`conversation_${conversationId}`);
  //     console.log(`✅ User ${userId} joined conversation ${conversationId}`);
  //   } catch (err) {
  //     console.error("Error joining conversation:", err);
  //     socket.emit(SocketEvents.SERVER_ERROR, { message: "Failed to join conversation." });
  //   }
  // });
  // socket.on(SocketEvents.CLIENT_CHAT_JOIN_ALL, async ({ conversationIds }) => {
  //   if (!Array.isArray(conversationIds) || conversationIds.length === 0) return;

  //   try {
  //     for (const conversationId of conversationIds) {
  //       // Validate if user is part of the conversation
  //       const isMember = await Conversation.exists({
  //         _id: conversationId,
  //         participants: userId,
  //       });

  //       if (isMember) {
  //         socket.join(`conversation_${conversationId}`);
  //         console.log(`✅ User ${userId} joined conversation ${conversationId}`);
  //       } else {
  //         console.warn(`⚠️ User ${userId} tried to join unauthorized conversation ${conversationId}`);
  //       }
  //     }
  //   } catch (err) {
  //     console.error("Error joining conversations:", err);
  //     socket.emit(SocketEvents.SERVER_ERROR, {
  //       message: "Failed to join conversations.",
  //     });
  //   }
  // });


  // Leave a conversation room silently
  // Leave multiple conversation rooms silently
  // socket.on(SocketEvents.CLIENT_CHAT_LEAVE_ALL, ({ conversationIds }) => {
  //   if (!Array.isArray(conversationIds) || conversationIds.length === 0) return;

  //   conversationIds.forEach(conversationId => {
  //     socket.leave(`conversation_${conversationId}`);
  //     console.log(`❌ User ${userId} left conversation ${conversationId}`);
  //   });
  // });


  // Leave a conversation room silently
  // socket.on(SocketEvents.CLIENT_CHAT_LEAVE, ({ conversationId }) => {
  //   if (!conversationId) return;

  //   socket.leave(`conversation_${conversationId}`);
  //   console.log(`❌ User ${userId} left conversation ${conversationId}`);
  // });

  // Typing event
  socket.on(SocketEvents.CLIENT_CHAT_TYPING, ({ conversationId }) => {
    if (!conversationId) return;

    // Broadcast to everyone else in the conversation room
    socket.to(`conversation_${conversationId}`).emit(SocketEvents.SERVER_CHAT_TYPING, {
      conversationId,
      userId,
    });
  });

  // Stop typing event
  socket.on(SocketEvents.CLIENT_CHAT_STOP_TYPING, ({ conversationId }) => {
    if (!conversationId) return;

    // Broadcast to everyone else in the conversation room
    socket.to(`conversation_${conversationId}`).emit(SocketEvents.SERVER_CHAT_STOP_TYPING, {
      conversationId,
      userId,
    });
  });
  // SEND message
  socket.on(SocketEvents.CLIENT_CHAT_SEND, async ({ conversationId, text }) => {
    if (!conversationId || !text?.trim()) return;

    try {
      // Validate membership
      const isMember = await Conversation.exists({ _id: conversationId, participants: userId });
      if (!isMember) {
        socket.emit(SocketEvents.SERVER_ERROR, { message: "Not authorized for this conversation." });
        return;
      }

      // Save message to DB
      const newMessage = await Messages.create({
        conversation: conversationId,
        sender: userId,
        content: text,
      });

      await Conversation.findByIdAndUpdate(
        conversationId,
        { lastMessage: newMessage._id }
      );

      const formattedMessage = {
        message_id: newMessage._id,
        sender: {
          _id: newMessage.sender,  // just the ObjectId
        },
        conversation: newMessage.conversation,
        content: newMessage.content,
        readBy: newMessage.readBy || [],
        createdAt: newMessage.createdAt,
        updatedAt: newMessage.updatedAt,
      };

      io.to(`conversation_${conversationId}`).emit(SocketEvents.SERVER_CHAT_RECEIVE, {
        recieved_message: formattedMessage
      });

      console.log(`💬 User ${userId} sent message in conversation ${conversationId}`);
    } catch (err) {
      console.error("Error sending message:", err);
      socket.emit(SocketEvents.SERVER_ERROR, { message: "Failed to send message." });
    }
  });

  // socket.on(SocketEvents.CLIENT_CHAT_DELIVERED, async ({ conversationId, messageId }) => {
  //   if (!conversationId || !messageId) return;

  //   try {
  //     // Validate membership
  //     const isMember = await Conversation.exists({
  //       _id: conversationId,
  //       participants: userId,
  //     });
  //     if (!isMember) {
  //       socket.emit(SocketEvents.SERVER_ERROR, { message: "Not authorized for this conversation." });
  //       return;
  //     }

  //     // Update DB: mark delivered
  //     const message = await Messages.findByIdAndUpdate(
  //       messageId,
  //       { $addToSet: { deliveredTo: userId } }, // prevent duplicates
  //       { new: true }
  //     );

  //     if (!message) {
  //       socket.emit(SocketEvents.SERVER_ERROR, { message: "Messages not found." });
  //       return;
  //     }

  //     // Broadcast status to other members in the conversation
  //     io.to(`conversation_${conversationId}`).emit(SocketEvents.SERVER_CHAT_MESSAGE_STATUS, {
  //       conversationId,
  //       messageId,
  //       status: "delivered",
  //       userId,
  //     });

  //     console.log(`📩 User ${userId} delivered message ${messageId} in conversation ${conversationId}`);
  //   } catch (err) {
  //     console.error("Error updating delivery:", err);
  //     socket.emit(SocketEvents.SERVER_ERROR, { message: "Failed to update delivery." });
  //   }
  // });
  socket.on(SocketEvents.CLIENT_CHAT_READ, async ({ conversationId, messageId }) => {
    if (!conversationId || !messageId) return;

    try {
      // Validate membership
      const isMember = await Conversation.exists({
        _id: conversationId,
        participants: userId,
      });
      if (!isMember) {
        socket.emit(SocketEvents.SERVER_ERROR, { message: "Not authorized for this conversation." });
        return;
      }

      // Update DB: mark read
      const message = await Messages.findByIdAndUpdate(
        messageId,
        { $addToSet: { readBy: userId } }, // add if not present
        { new: true }
      );

      if (!message) {
        socket.emit(SocketEvents.SERVER_ERROR, { message: "Messages not found." });
        return;
      }

      // Broadcast status to other members in the conversation
      io.to(`conversation_${conversationId}`).emit(SocketEvents.SERVER_CHAT_MESSAGE_STATUS, {
        conversationId,
        messageId,
        status: "read",
        userId,
      });

      console.log(`👀 User ${userId} read message ${messageId} in conversation ${conversationId}`);
    } catch (err) {
      console.error("Error marking message as read:", err);
      socket.emit(SocketEvents.SERVER_ERROR, { message: "Failed to mark as read." });
    }
  });
};
