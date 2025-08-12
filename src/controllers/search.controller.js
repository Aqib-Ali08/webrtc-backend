import StatusCodes from "../constants/statusCode.js";
import User from "../models/user.model.js";

/**
 * GET /api/searchUser?q=keyword
 * Protected by authenticateToken middleware
 */
export const SearchUserController = async (req, res) => {
    try {
        const { q } = req.query;
        const loggedInUserId = req.user?.id;

        if (!q || q.trim() === "") {
            return res.status(StatusCodes.OK).json({ count: 0, results: [] });
        }
        if (!loggedInUserId) {
            return res.status(StatusCodes.UNAUTHORIZED).json({ message: "Unauthorized" });
        }

        const loggedInUser = await User.findById(loggedInUserId).select(
            "friends sentRequests receivedRequests"
        );

        if (!loggedInUser) {
            return res.status(StatusCodes.NOT_FOUND).json({ message: "Logged-in user not found" });
        }

        const users = await User.find({
            $and: [
                {
                    $or: [
                        { full_name: { $regex: q, $options: "i" } },
                        { username: { $regex: q, $options: "i" } },
                    ]
                },
                { _id: { $ne: loggedInUserId } }
            ]
        })
            .select("-password -sentRequests -receivedRequests -friends -blockedUsers -__v -createdAt -updatedAt")
            .limit(20);

        const friendsSet = new Set(loggedInUser.friends.map(id => id.toString()));
        const sentReqSet = new Set(loggedInUser.sentRequests.map(id => id.toString()));
        const receivedReqSet = new Set(loggedInUser.receivedRequests.map(id => id.toString()));

        const resultsWithFlags = users.map(user => {
            const userIdStr = user._id.toString();

            const isFriend = friendsSet.has(userIdStr);
            const isSentRequest = sentReqSet.has(userIdStr);
            const hasRequestSentToU = receivedReqSet.has(userIdStr);

            return {
                ...user.toObject(),
                isFriend,
                isSentRequest,
                hasRequestSentToU,
                canSendFriendRequest: !isFriend && !isSentRequest && !hasRequestSentToU,
            };
        });

        res.status(StatusCodes.OK).json({
            count: resultsWithFlags.length,
            results: resultsWithFlags
        });
    } catch (error) {
        console.error("Error searching users with relations:", error);
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: "Server Error" });
    }
};