import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId, // User who will receive the notification
    ref: "User",
    required: true,
  },
  type: {
    type: String, // Type of notification
    enum: ["friend_request", "meeting_invite", "chat_message", "note_update"],
    required: true,
  },
  senderId: {
    type: mongoose.Schema.Types.ObjectId, // User who triggered the notification (optional)
    ref: "User",
  },
  referenceId: {
    type: mongoose.Schema.Types.ObjectId, // Optional reference (e.g., conversationId, meetingId, noteId)
    refPath: "referenceType",
  },
  referenceType: {
    type: String, // The model of the reference: "Conversation", "Meeting", "Note"
  },
  message: {
    type: String, // Short message for display
    required: true,
  },
  isRead: {
    type: Boolean,
    default: false, // Mark when user has seen it
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.model("Notification", notificationSchema);
