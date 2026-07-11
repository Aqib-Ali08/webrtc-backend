import Note from "../models/note.model.js";
import SharedNote from "../models/sharedNote.model.js";
import Notification from "../models/notification.model.js";
import User from "../models/user.model.js";
import { getIO } from "../config/socket.config.js";
import { getUserSockets } from "../utils/connectedUsers.js";
import SocketEvents from "../constants/socketEvent.js";

// Get notes owned by logged-in user
export const getNotes = async (req, res) => {
  try {
    const notes = await Note.find({ userId: req.user.id }).sort({ updatedAt: -1 });
    res.status(200).json(notes);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Create a new note
export const createNote = async (req, res) => {
  try {
    const { title, subtitle, description, category, color } = req.body;
    
    if (!title) {
      return res.status(400).json({ message: "Title is required" });
    }

    const note = await Note.create({
      userId: req.user.id,
      title,
      subtitle: subtitle || "",
      description: description || "",
      category: category || "Work",
      color: color || "#ffffff"
    });
    
    res.status(201).json(note);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update an existing note
export const updateNote = async (req, res) => {
  try {
    const { title, subtitle, description, category, color } = req.body;
    const note = await Note.findById(req.params.id);

    if (!note) {
      return res.status(404).json({ message: "Note not found" });
    }

    if (note.userId.toString() !== req.user.id) {
      return res.status(403).json({ message: "Not authorized to edit this note" });
    }

    note.title = title !== undefined ? title : note.title;
    note.subtitle = subtitle !== undefined ? subtitle : note.subtitle;
    note.description = description !== undefined ? description : note.description;
    note.category = category !== undefined ? category : note.category;
    note.color = color !== undefined ? color : note.color;

    await note.save();
    res.status(200).json(note);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete a note and its share references
export const deleteNote = async (req, res) => {
  try {
    const note = await Note.findById(req.params.id);

    if (!note) {
      return res.status(404).json({ message: "Note not found" });
    }

    if (note.userId.toString() !== req.user.id) {
      return res.status(403).json({ message: "Not authorized to delete this note" });
    }

    await Note.findByIdAndDelete(req.params.id);
    
    // Cascade delete sharing records
    await SharedNote.deleteMany({ noteId: req.params.id });
    
    res.status(200).json({ message: "Note and its sharing records deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Share a note with another user
export const shareNote = async (req, res) => {
  try {
    const { noteId, recipientId } = req.body;

    if (!noteId || !recipientId) {
      return res.status(400).json({ message: "noteId and recipientId are required" });
    }

    const note = await Note.findById(noteId);
    if (!note) {
      return res.status(404).json({ message: "Note not found" });
    }

    if (note.userId.toString() !== req.user.id) {
      return res.status(403).json({ message: "Not authorized to share this note" });
    }

    // Check if recipient exists
    const recipient = await User.findById(recipientId);
    if (!recipient) {
      return res.status(404).json({ message: "Recipient user not found" });
    }

    // Check if already shared with this user
    const alreadyShared = await SharedNote.findOne({
      noteId,
      fromId: req.user.id,
      toId: recipientId
    });

    if (alreadyShared) {
      return res.status(400).json({ message: "Note is already shared with this user" });
    }

    const shared = await SharedNote.create({
      noteId,
      fromId: req.user.id,
      toId: recipientId
    });

    // Create database Notification log for the recipient
    await Notification.create({
      userId: recipientId,
      type: "note_update",
      senderId: req.user.id,
      referenceId: noteId,
      referenceType: "Note",
      message: `${req.user.full_name} shared a note with you: "${note.title}"`
    });

    // Push realtime Socket event notification if recipient is online
    const io = getIO();
    if (io) {
      const recipientSockets = getUserSockets(recipientId);
      recipientSockets.forEach((socketId) => {
        io.to(socketId).emit(SocketEvents.NOTIFY, {
          type: "note_update",
          message: `${req.user.full_name} shared a note with you: "${note.title}"`,
          sender: {
            id: req.user.id,
            full_name: req.user.full_name,
            profilePic: req.user.profilePic
          },
          referenceId: noteId,
          referenceType: "Note",
          createdAt: new Date().toISOString()
        });
      });
    }

    res.status(201).json(shared);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get all incoming & outgoing shared notes for logged-in user
export const getSharedNotes = async (req, res) => {
  try {
    const currentUserId = req.user.id;

    // 1. Fetch received shares
    const receivedShares = await SharedNote.find({ toId: currentUserId })
      .populate("noteId")
      .populate("fromId", "full_name username profilePic")
      .populate("toId", "full_name username profilePic")
      .sort({ createdAt: -1 });

    // 2. Fetch sent shares
    const sentShares = await SharedNote.find({ fromId: currentUserId })
      .populate("noteId")
      .populate("fromId", "full_name username profilePic")
      .populate("toId", "full_name username profilePic")
      .sort({ createdAt: -1 });

    // Filter out orphan references where the noteId was deleted, then map
    const received = receivedShares
      .filter(item => item.noteId)
      .map(item => ({
        id: item._id,
        noteId: item.noteId._id,
        title: item.noteId.title,
        description: item.noteId.description,
        from: item.fromId?.full_name || "Unknown User",
        fromId: item.fromId?._id,
        to: item.toId?.full_name || "Me",
        toId: item.toId?._id,
        sharedAt: item.createdAt,
        isIncoming: true
      }));

    const sent = sentShares
      .filter(item => item.noteId)
      .map(item => ({
        id: item._id,
        noteId: item.noteId._id,
        title: item.noteId.title,
        description: item.noteId.description,
        from: item.fromId?.full_name || "Me",
        fromId: item.fromId?._id,
        to: item.toId?.full_name || "Unknown User",
        toId: item.toId?._id,
        sharedAt: item.createdAt,
        isIncoming: false
      }));

    res.status(200).json({ received, sent });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Cancel/unsend note share
export const unshareNote = async (req, res) => {
  try {
    const share = await SharedNote.findById(req.params.id);

    if (!share) {
      return res.status(404).json({ message: "Share reference not found" });
    }

    // Verify only the original sender can cancel the share
    if (share.fromId.toString() !== req.user.id) {
      return res.status(403).json({ message: "Not authorized to unshare this note" });
    }

    await SharedNote.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "Note unshared successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
