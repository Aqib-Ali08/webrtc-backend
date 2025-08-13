// models/Conversation.js
import mongoose from "mongoose";

const { Schema } = mongoose;

const conversationSchema = new Schema(
  {
    type: {
      type: String,
      enum: ["direct", "group"],
      default: "direct",
    },
    name: {
      type: String,
      trim: true,
      required: function () {
        return this.type === "group";
      },
    },
    participants: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },
    ],
    lastMessage: {
      type: Schema.Types.ObjectId,
      ref: "Message",
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: true, // adds createdAt & updatedAt
  }
);

// Optional: Prevent duplicate direct conversations
conversationSchema.index(
  { participants: 1 },
  { unique: true, partialFilterExpression: { type: "direct" } }
);

export default mongoose.model("Conversation", conversationSchema);
