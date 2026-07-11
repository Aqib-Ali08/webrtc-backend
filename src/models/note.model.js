import mongoose from "mongoose";

const noteSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  subtitle: {
    type: String,
    trim: true,
    default: ""
  },
  description: {
    type: String,
    default: ""
  },
  category: {
    type: String,
    default: "Work"
  },
  color: {
    type: String,
    default: "#ffffff"
  }
}, {
  timestamps: true
});

const Note = mongoose.model("Note", noteSchema);
export default Note;
