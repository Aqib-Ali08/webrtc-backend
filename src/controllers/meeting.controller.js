import Meeting from "../models/meeting.model.js";
import Notification from "../models/notification.model.js";
import crypto from "crypto";
import { getIO } from "../config/socket.config.js";
import { getUserSockets } from "../utils/connectedUsers.js";
import SocketEvents from "../constants/socketEvent.js";

// @desc    Create a new meeting
// @route   POST /api/v1/meetings
// @access  Private
export const createMeeting = async (req, res, next) => {
    try {
        const { title, startTime, endTime, members } = req.body;
        const userId = req.user.id; // From verifyJWT middleware

        if (!title || !startTime) {
            return res.status(400).json({ success: false, message: "Title and start time are required" });
        }

        const roomId = crypto.randomUUID();

        // Include creator in members if not already there
        const meetingMembers = members ? [...new Set([...members, userId])] : [userId];

        const newMeeting = await Meeting.create({
            title,
            roomId,
            startTime,
            endTime,
            creator: userId,
            members: meetingMembers
        });

        // Populate creator and members
        const populatedMeeting = await Meeting.findById(newMeeting._id)
            .populate("creator", "full_name username profilePic")
            .populate("members", "full_name username profilePic");

        // Send notifications to added members (excluding the creator)
        const io = getIO();
        const notificationPromises = meetingMembers.map(async (memberId) => {
            if (memberId.toString() !== userId.toString()) {
                // Create DB Notification
                await Notification.create({
                    userId: memberId,
                    type: "meeting_invite",
                    senderId: userId,
                    referenceId: newMeeting._id,
                    referenceType: "Meeting",
                    message: `${req.user.full_name || req.user.username} invited you to a meeting: "${title}"`
                });

                // Push realtime Socket event
                if (io) {
                    const recipientSockets = getUserSockets(memberId.toString());
                    recipientSockets.forEach((socketId) => {
                        io.to(socketId).emit(SocketEvents.NOTIFY, {
                            type: "meeting_invite",
                            message: `${req.user.full_name || req.user.username} invited you to a meeting: "${title}"`,
                            sender: {
                                id: req.user.id,
                                full_name: req.user.full_name,
                                profilePic: req.user.profilePic
                            },
                            referenceId: newMeeting._id,
                            referenceType: "Meeting",
                            createdAt: new Date().toISOString()
                        });
                    });
                }
            }
        });
        await Promise.all(notificationPromises);

        return res.status(201).json({
            success: true,
            data: populatedMeeting,
            message: "Meeting created successfully"
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get all meetings for a user
// @route   GET /api/v1/meetings
// @access  Private
export const getMeetings = async (req, res, next) => {
    try {
        const userId = req.user.id;

        const meetings = await Meeting.find({
            $or: [{ creator: userId }, { members: userId }]
        })
        .populate("creator", "full_name username profilePic")
        .populate("members", "full_name username profilePic")
        .sort({ startTime: 1 });

        return res.status(200).json({
            success: true,
            data: meetings,
            message: "Meetings fetched successfully"
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get meeting by room ID
// @route   GET /api/v1/meetings/:roomId
// @access  Private
export const getMeetingByRoomId = async (req, res, next) => {
    try {
        const { roomId } = req.params;

        const meeting = await Meeting.findOne({ roomId })
            .populate("creator", "full_name username profilePic")
            .populate("members", "full_name username profilePic");

        if (!meeting) {
            return res.status(404).json({ success: false, message: "Meeting not found" });
        }

        return res.status(200).json({
            success: true,
            data: meeting,
            message: "Meeting fetched successfully"
        });
    } catch (error) {
        next(error);
    }
};
