import express from "express";
import {
  getNotes,
  createNote,
  updateNote,
  deleteNote,
  shareNote,
  getSharedNotes,
  unshareNote
} from "../controllers/note.controller.js";
import authenticateToken from "../middlewares/authenticateToken.middleware.js";

const router = express.Router();

// Apply auth middleware to protect all endpoints in this file
router.use(authenticateToken);

// Personal notes CRUD
router.get("/", getNotes);
router.post("/", createNote);
router.put("/:id", updateNote);
router.delete("/:id", deleteNote);

// Shared notes actions
router.get("/shared", getSharedNotes);
router.post("/shared", shareNote);
router.delete("/shared/:id", unshareNote);

export default router;
