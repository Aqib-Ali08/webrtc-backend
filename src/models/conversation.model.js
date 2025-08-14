import mongoose from "mongoose";

const conversationSchema = new mongoose.Schema(
  {
    _id: {
      type: mongoose.Schema.Types.ObjectId,
      default: () => new mongoose.Types.ObjectId(),
      alias: "conversationId", // allows doc.conversationId access
    },
    type: {
      type: String,
      enum: ["direct", "group"],
      required: true,
      default: "direct",
    },
    participants: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
      }
    ],
    directKey: {
      type: String, // user1Id_user2Id sorted
      index: true,
      sparse: true // only for direct chats
    },
    groupName: { type: String, trim: true, default: null },
    groupAvatar: { type: String, default: null },
    lastMessage: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Messages",
      default: null
    }
  },
  { timestamps: true }
);

// Make conversationId appear instead of _id
conversationSchema.set("toJSON", {
  virtuals: true,
  versionKey: false,
  transform: (_, ret) => {
    ret.conversationId = ret._id;
    delete ret._id;
  }
});

// DirectKey must be unique for direct conversations
conversationSchema.index({ directKey: 1 }, { unique: true, partialFilterExpression: { type: "direct" } });

export default mongoose.model("Conversation", conversationSchema);
