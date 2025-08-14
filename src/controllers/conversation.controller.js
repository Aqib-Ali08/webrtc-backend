import Conversation from "../models/conversation.model.js";
export const getChats = async (req, res) => {
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
