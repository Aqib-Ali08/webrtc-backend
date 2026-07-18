import express from "express";
import authenticateToken from "../middlewares/authenticateToken.middleware.js";
import { createMeeting, getMeetings, getMeetingByRoomId } from "../controllers/meeting.controller.js";

const router = express.Router();

// Apply auth middleware to all routes
router.use(authenticateToken);

router.post("/", createMeeting);
router.get("/", getMeetings);
router.get("/:roomId", getMeetingByRoomId);

export default router;
