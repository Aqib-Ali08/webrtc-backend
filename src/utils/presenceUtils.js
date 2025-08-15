import Conversation from '../models/conversation.model.js';

/**
 * Returns an array of userIds who should receive presence updates
 * for the given userId (all participants in the same conversations, except self)
 */
export const getRelevantUsersForPresence = async (userId) => {
  if (!userId) return [];

  // Fetch all conversations where the user is a participant
  const conversations = await Conversation.find({
    participants: userId
  }).select('participants').lean();

  const relevantUserSet = new Set();

  conversations.forEach(conv => {
    conv.participants.forEach(participantId => {
      if (participantId.toString() !== userId.toString()) {
        relevantUserSet.add(participantId.toString());
      }
    });
  });

  return Array.from(relevantUserSet);
};
