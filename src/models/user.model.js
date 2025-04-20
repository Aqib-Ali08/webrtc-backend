import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    full_name: {
        type: String,
        required: true,
        trim: true,
    },
    username: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
    },
    password: {
        type: String,
        required: true,
    },
    profilePic: {
        type: String,
        default: "",
    },
    sentRequests: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
        },
    ],

    receivedRequests: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
        },
    ],

    friends: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
        },
    ],

    blockedUsers: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
        },
    ],
}, {
    timestamps: true,
});

const User = mongoose.model("User", userSchema);

export default User;
