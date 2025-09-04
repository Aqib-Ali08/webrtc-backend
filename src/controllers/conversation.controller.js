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

    // Ensure user is part of this conversation
    const conversation = await Conversation.findOne({
      _id: conversation_id,
      participants: userId,
    });

    if (!conversation) {
      return res.status(403).json({ error: "Access denied" });
    }

    // Fetch all messages except those deleted for this user
    const messages = await Messages.find({
      conversation: conversation_id,
      deletedFor: { $ne: userId },
    })
      .populate("sender", "_id name avatar")
      .sort({ createdAt: -1 }) // newest first
      .lean();

    // Reformat _id → message_id
    const formattedMessages = messages.map(({ _id, ...rest }) => ({
      message_id: _id,
      ...rest,
    }));

    res.status(200).json({ messages: formattedMessages });
  } catch (err) {
    console.error("Error fetching chat history:", err);
    res.status(500).json({ error: "Server error" });
  }
};
export const toggleChatBlockUnblock = async (req, res) => {
  try {
    const { conversationId } = req.body;
    const userId = req.user.id;

    if (!mongoose.isValidObjectId(conversationId)) {
      return res.status(400).json({ error: "Invalid conversation ID" });
    }

    const conversation = await Conversation.findOne({
      _id: conversationId,
      type: "direct",
      participants: userId
    });

    if (!conversation) {
      return res.status(403).json({ error: "Access denied" });
    }

    if (conversation.blockedBy && conversation.blockedBy.toString() === userId) {
      // 🔓 Unblock
      conversation.blockedBy = null;
      await conversation.save();
      return res.json({ message: "User unblocked" });
    } else if (!conversation.blockedBy) {
      // 🔒 Block
      conversation.blockedBy = userId;
      await conversation.save();
      return res.json({ message: "User blocked" });
    } else {
      // Other user has already blocked
      return res.status(400).json({ error: "The other user has already blocked you" });
    }
  } catch (err) {
    console.error("Error toggling block/unblock:", err);
    res.status(500).json({ error: "Server error" });
  }
};
export const ClearChatHistoryController = async (req, res) => {
  try {
    const { conversationId } = req.body;
    const userId = req.user.id;
    if (!mongoose.isValidObjectId(conversationId)) {
      return res.status(400).json({ error: "Invalid conversation ID" });
    }
    const conversation = await Conversation.findOne({
      _id: conversationId,
      participants: userId
    });
    if (!conversation) {
      return res.status(403).json({ error: "Access denied" });
    }
    await Messages.deleteMany({ conversation: conversationId });
    conversation.lastMessage = null;
    await conversation.save();
    res.json({ message: "Chat history cleared" });
  }
  catch (err) {
    console.error("Error clearing chat history:", err);
    res.status(500).json({ error: "Server error" });
  }
}
export const deleteMessage = async (req, res) => {
  try {
    const { messageId, actionType } = req.body; // actionType: "deleteForMe" | "deleteForAll"
    const userId = req.user.id;

    if (!mongoose.isValidObjectId(messageId)) {
      return res.status(400).json({ error: "Invalid message ID" });
    }

    const message = await Messages.findById(messageId).populate("conversation");
    if (!message) {
      return res.status(404).json({ error: "Message not found" });
    }

    // ensure user is in the conversation
    if (!message.conversation.participants.includes(userId)) {
      return res.status(403).json({ error: "Access denied" });
    }

    // delete for me
    if (actionType === "deleteForMe") {
      if (!message.deletedFor) {
        message.deletedFor = [];
      }
      if (!message.deletedFor.includes(userId)) {
        message.deletedFor.push(userId);
        await message.save();
      }
      return res.json({ message: "Message hidden for you" });
    }

    // delete for all
    if (actionType === "deleteForAll") {
      if (message.sender.toString() !== userId) {
        return res.status(403).json({ error: "Only sender can delete for all" });
      }
      await Messages.findByIdAndDelete(messageId);
      return res.json({ message: "Message deleted for everyone" });
    }

    return res.status(400).json({ error: "Invalid actionType" });
  } catch (err) {
    console.error("Error deleting message:", err);
    res.status(500).json({ error: "Server error" });
  }
};
