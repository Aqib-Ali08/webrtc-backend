import User from "../models/user.model.js";
import StatusCodes from "../constants/statusCode.js";
import mongoose from "mongoose";


export const list_other_users = async (req, res) => {
  try {
    const { page, limit } = req.body;
    const userId = req.user.id;

    // Validate inputs
    if (!userId || !mongoose.isValidObjectId(userId)) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        status: "error",
        message: "Valid user ID is required",
      });
    }

    if (![page, limit].every((n) => Number.isInteger(n) && n > 0)) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        status: "error",
        message: "Page and limit must be positive integers",
      });
    }

    const skip = (page - 1) * limit;

    // Fetch logged-in user (for sentRequests)
    const currentUser = await User.findById(userId).select("sentRequests");
    if (!currentUser) {
      return res.status(StatusCodes.NOT_FOUND).json({
        status: "error",
        message: "Logged-in user not found",
      });
    }

    const sentRequestIds = new Set(currentUser.sentRequests.map(String));

    // Fetch other users and total count in parallel
    const [users, totalUsers] = await Promise.all([
      User.find({ _id: { $ne: userId } })
        .select("full_name username profilePic")
        .skip(skip)
        .limit(limit),
      User.countDocuments({ _id: { $ne: userId } })
    ]);

    // Add sentRequest boolean
    const usersWithStatus = users.map((user) => ({
      ...user.toObject(),
      sentRequest: sentRequestIds.has(user._id.toString()),
    }));

    res.status(StatusCodes.OK).json({
      status: "success",
      page,
      limit,
      totalUsers,
      totalPages: Math.ceil(totalUsers / limit),
      data: usersWithStatus,
    });
  } catch (error) {
    console.error("Error in list_other_users:", error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      status: "error",
      message: "Server error while fetching users",
    });
  }
};


export const list_recieved_requests = async (req, res) => {
  try {
    const { page, limit } = req.body; // default values
    const userId = req.user.id;

    // Validate userId
    if (!userId || !mongoose.isValidObjectId(userId)) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        status: "error",
        message: "Valid user ID is required",
      });
    }

    // Validate pagination params
    if (![page, limit].every((n) => Number.isInteger(n) && n > 0)) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        status: "error",
        message: "Page and limit must be positive integers",
      });
    }

    // Fetch total count of received requests
    const user = await User.findById(userId).select("receivedRequests");
    if (!user) {
      return res.status(StatusCodes.NOT_FOUND).json({
        status: "error",
        message: "User not found",
      });
    }

    const totalRequests = user.receivedRequests.length;
    if (totalRequests === 0) {
      return res.status(StatusCodes.OK).json({
        status: "success",
        page,
        limit,
        totalRequests: 0,
        totalPages: 0,
        data: [],
      });
    }

    const skip = (page - 1) * limit;

    // Paginate & populate
    const paginatedRequests = await User.findById(userId)
      .select("receivedRequests")
      .populate({
        path: "receivedRequests",
        select: "full_name username profilePic",
        options: {
          skip,
          limit,
        },
      });

    res.status(StatusCodes.OK).json({
      status: "success",
      page,
      limit,
      totalRequests,
      totalPages: Math.ceil(totalRequests / limit),
      data: paginatedRequests.receivedRequests,
    });

  } catch (error) {
    console.error("Error in list_recieved_requests:", error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      status: "error",
      message: "Server error while fetching received requests",
    });
  }
};


export const list_connected_users = async (req, res) => {
  try {
    const { page, limit } = req.body;
    const userId = req.user.id;

    // Validate userId
    if (!userId || !mongoose.isValidObjectId(userId)) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        status: "error",
        message: "Valid user ID is required",
      });
    }

    // Validate pagination params
    if (![page, limit].every((n) => Number.isInteger(n) && n > 0)) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        status: "error",
        message: "Page and limit must be positive integers",
      });
    }

    // Fetch current user (friends + blockedUsers)
    const currentUser = await User.findById(userId).select("friends blockedUsers");
    if (!currentUser) {
      return res.status(StatusCodes.NOT_FOUND).json({
        status: "error",
        message: "User not found",
      });
    }

    const totalConnections = currentUser.friends.length;
    if (totalConnections === 0) {
      return res.status(StatusCodes.OK).json({
        status: "success",
        page,
        limit,
        totalConnections: 0,
        totalPages: 0,
        data: [],
      });
    }

    const skip = (page - 1) * limit;

    // Convert blockedUsers to a Set for O(1) lookups
    const blockedSet = new Set(currentUser.blockedUsers.map(id => id.toString()));

    // Paginate & populate connected users
    const paginatedConnections = await User.findById(userId)
      .select("friends")
      .populate({
        path: "friends",
        select: "full_name username profilePic",
        options: {
          skip,
          limit,
        },
      });

    // Add isBlocked boolean for each friend
    const friendsWithStatus = paginatedConnections.friends.map(friend => ({
      _id: friend._id,
      full_name: friend.full_name,
      username: friend.username,
      profilePic: friend.profilePic,
      isBlocked: blockedSet.has(friend._id.toString()),
    }));

    res.status(StatusCodes.OK).json({
      status: "success",
      page,
      limit,
      totalConnections,
      totalPages: Math.ceil(totalConnections / limit),
      data: friendsWithStatus,
    });

  } catch (error) {
    console.error("Error in list_connected_users:", error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      status: "error",
      message: "Server error while fetching connected users",
    });
  }
};


// Not required for now, but can be used later

// export const getAllUsers = async (req, res) => {
//   try {
//     const currentUserId = req.user.id;

//     // Fetch all users except the current user
//     const users = await User.find({ _id: { $ne: currentUserId } })
//       .select('full_name username profilePic');

//     // Fetch current user's relationships
//     const currentUser = await User.findById(currentUserId)
//       .select('sentRequests receivedRequests friends blockedUsers')
//       .populate('sentRequests', 'full_name username profilePic')
//       .populate('receivedRequests', 'full_name username profilePic')
//       .populate('friends', 'full_name username profilePic')
//       .populate('blockedUsers', 'full_name username profilePic');

//     if (!currentUser) {
//       return res.status(StatusCodes.NOT_FOUND).json({ message: "Current user not found." });
//     }

//     // Create sets for quick lookup
//     const receivedRequestIds = new Set(currentUser.receivedRequests.map(user => user._id.toString()));
//     const sentRequestIds = new Set(currentUser.sentRequests.map(user => user._id.toString()));
//     const friendIds = new Set(currentUser.friends.map(user => user._id.toString()));
//     const blockedUserIds = new Set(currentUser.blockedUsers.map(user => user._id.toString()));

//     // Prepare the filtered users with status
//     const filteredUsers = users.map(user => {
//       const userId = user._id.toString();
//       let status = 'none';

//       // Assign status based on relationship
//       if (receivedRequestIds.has(userId)) {
//         status = 'received';
//       } else if (sentRequestIds.has(userId)) {
//         status = 'sent';
//       } else if (friendIds.has(userId)) {
//         status = 'friend';
//       } else if (blockedUserIds.has(userId)) {
//         status = 'blocked';
//       }

//       return {
//         _id: user._id,
//         full_name: user.full_name,
//         username: user.username,
//         profilePic: user.profilePic,
//         status
//       };
//     });

//     // Categorize users into the different groups
//     const addNewConnection = filteredUsers.filter(user => user.status === 'none');
//     const sentRequests = filteredUsers.filter(user => user.status === 'sent');
//     const receivedRequests = filteredUsers.filter(user => user.status === 'received');
//     const connectionManagement = filteredUsers.filter(user => user.status === 'friend');

//     res.status(StatusCodes.OK).json({
//       status: 'success',
//       data: {
//         addNewConnection,
//         sentRequests,
//         receivedRequests,
//         connectionManagement
//       },
//       // currentUserData: {
//       //   sentRequests: currentUser.sentRequests,
//       //   receivedRequests: currentUser.receivedRequests,
//       //   friends: currentUser.friends,
//       //   blockedUsers: currentUser.blockedUsers
//       // },
//     });
//   } catch (error) {
//     console.error('Error in getAllUsers:', error);
//     res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: "Server error" });
//   }
// };
