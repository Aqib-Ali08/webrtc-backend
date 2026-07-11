import express from "express";
import {
  getNotifications,
  markAsRead,
  markAllAsRead,
} from "../controllers/notification.controller.js";
import authenticateToken from "../middlewares/authenticateToken.middleware.js";

const router = express.Router();

// Apply auth middleware to protect all notification routes
router.use(authenticateToken);

router.get("/", getNotifications);
router.put("/mark-all-read", markAllAsRead);
router.put("/:id/read", markAsRead);

export default router;
