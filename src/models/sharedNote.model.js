import mongoose from "mongoose";

const sharedNoteSchema = new mongoose.Schema({
  noteId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Note",
    required: true
  },
  fromId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  toId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  }
}, {
  timestamps: true
});

const SharedNote = mongoose.model("SharedNote", sharedNoteSchema);
export default SharedNote;
