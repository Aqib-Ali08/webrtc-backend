import mongoose from "mongoose";

const meetingSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true,
    },
    roomId: {
        type: String,
        required: true,
        unique: true,
    },
    startTime: {
        type: Date,
        required: true,
    },
    endTime: {
        type: Date,
    },
    creator: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    members: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
        }
    ],
    status: {
        type: String,
        enum: ["scheduled", "active", "completed", "cancelled"],
        default: "scheduled",
    }
}, {
    timestamps: true,
});

const Meeting = mongoose.model("Meeting", meetingSchema);

export default Meeting;
