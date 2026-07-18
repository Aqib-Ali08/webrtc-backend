import express from "express";
import authenticateToken from "../middlewares/authenticateToken.middleware.js";
import { createMeeting, getMeetings, getMeetingByRoomId, updateMeeting, deleteMeeting } from "../controllers/meeting.controller.js";

const router = express.Router();

// Apply auth middleware to all routes
router.use(authenticateToken);

router.post("/", createMeeting);
router.get("/", getMeetings);
router.get("/:roomId", getMeetingByRoomId);
router.put("/:id", updateMeeting);
router.delete("/:id", deleteMeeting);

export default router;
