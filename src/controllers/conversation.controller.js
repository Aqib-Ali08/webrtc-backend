// controllers/chatController.js
import Conversation from "../models/conversation.model.js";

export const getChats = async (req, res) => {
  try {
    const userId = req.user.id; // set by auth middleware

    const chats = await Conversation.find({
      participants: userId
    })
      .populate("participants", "id name avatar")
      .populate({
        path: "lastMessage",
        select: "id content createdAt",
      })
      .sort({ updatedAt: -1 });

    res.json(chats);
  } catch (err) {
    console.error("Error fetching chats:", err);
    res.status(500).json({ message: "Server error" });
  }
};
