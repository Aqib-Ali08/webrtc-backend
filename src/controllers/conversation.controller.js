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
        select: "_id content createdAt",
      })
      .sort({ updatedAt: -1 })
      .lean();

    const formattedChats = chats.map(chat => {
      const { _id, id, participants, directKey, ...rest } = chat;

      // Filter out logged-in user from participants
      const otherParticipants = participants.filter(
        p => p._id.toString() !== userId
      );

      // Rename lastMessage._id -> message_id
      let lastMessage = null;
      if (chat.lastMessage) {
        const { _id: messageId, ...msgRest } = chat.lastMessage;
        lastMessage = {
          message_id: messageId,
          ...msgRest
        };
      }

      return {
        conversation_id: _id, // renamed
        participants: otherParticipants,
        ...rest,
        lastMessage
      };
    });

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
      .limit(totalMessages - 1) // exclude the last message
      .lean();

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
