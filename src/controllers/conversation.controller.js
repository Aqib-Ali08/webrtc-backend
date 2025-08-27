import Messages from "../models/messages.model.js";
import Conversation from "../models/conversation.model.js";
import mongoose from "mongoose";
// it lists all the users that are friends of logged in user
export const get_users_for_chats = async (req, res) => {
  try {
    const userId = req.user.id;

    const chats = await Conversation.find({ participants: userId })
      .populate("participants", "_id full_name profilePic")
      .populate({
        path: "lastMessage",
        select: "_id content createdAt sender readBy", // 👈 include sender + readBy
        populate: {
          path: "sender",
          select: "_id full_name profilePic", // 👈 optional: so you know who sent it
        },
      })
      .sort({ updatedAt: -1 })
      .lean();

    const formattedChats = await Promise.all(chats.map(async chat => {
      const { _id, id, participants, directKey, ...rest } = chat;

      // Filter out logged-in user from participants
      const otherParticipants = participants.filter(
        p => p._id.toString() !== userId
      );

      // Format lastMessage
      let lastMessage = null;
      if (chat.lastMessage) {
        const { _id: messageId, content, createdAt, sender, readBy } = chat.lastMessage;

        lastMessage = {
          messageId,
          content,
          createdAt,
          sender,
          readBy,
          status: readBy.includes(userId) ? "read" : "unread", // 👈 derive status for current user
        };
      }
      const unreadCount = await Messages.countDocuments({
        conversation: chat._id,
        sender: { $ne: userId }, // only messages from others
        readBy: { $ne: userId }, // user hasn’t read
      });
      return {
        conversationId: _id, // renamed
        participants: otherParticipants,
        ...rest,
        lastMessage,
        unreadCount
      };
    })
    )
    res.json(formattedChats);
  } catch (err) {
    console.error("Error fetching chats:", err);
    res.status(500).json({ message: "Internal Server error" });
  }
};


export const get_users_chat_history = async (req, res) => {
  try {
    const { conversation_id } = req.query;
    const userId = req.user.id;

    if (!mongoose.isValidObjectId(conversation_id)) {
      return res.status(400).json({ error: "Invalid conversation ID" });
    }

    const conversation = await Conversation.findOne({
      _id: conversation_id,
      participants: userId
    });

    if (!conversation) {
      return res.status(403).json({ error: "Access denied" });
    }

    const totalMessages = await Messages.countDocuments({ conversation: conversation_id });

    const messages = await Messages.find({ conversation: conversation_id })
      .populate("sender", "_id name avatar")
      .sort({ createdAt: -1 }) // newest first
      .lean();
    // .skip(offset)           
    // .limit(limit)
    const formattedMessages = messages.map(msg => ({
      message_id: msg._id,   // rename
      ...msg,
      _id: undefined         // remove old _id
    }));

    res.status(200).json({ messages: formattedMessages });
  } catch (err) {
    console.error("Error fetching chat history:", err);
    res.status(500).json({ error: "Server error" });
  }
};
