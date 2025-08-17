import mongoose from "mongoose";
import Conversation from "../models/conversation.model.js";

export const getRelevantUsersForPresence = async (userId) => {
  if (!userId) return [];

  const userIdObj = new mongoose.Types.ObjectId(userId);

  const result = await Conversation.aggregate([
    { $match: { participants: userIdObj } },       // conversations where user is included
    { $unwind: "$participants" },                  // flatten participants array
    { $match: { participants: { $ne: userIdObj } } }, // remove self
    { $group: { _id: null, users: { $addToSet: "$participants" } } } // dedupe
  ]);

  return result[0]?.users.map(u => u.toString()) || [];
};
