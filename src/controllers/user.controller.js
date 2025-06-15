import User from "../models/user.model.js";
import StatusCodes from "../constants/statusCode.js";
export const getAllUsers = async (req, res) => {
    try {
      const currentUserId = req.user.id;
  
      // Fetch all users except the current user
      const users = await User.find({ _id: { $ne: currentUserId } })
        .select('full_name username profilePic');
  
      // Fetch current user's relationships
      const currentUser = await User.findById(currentUserId)
        .select('sentRequests receivedRequests friends blockedUsers')
        .populate('sentRequests', 'full_name username profilePic')
        .populate('receivedRequests', 'full_name username profilePic')
        .populate('friends', 'full_name username profilePic')
        .populate('blockedUsers', 'full_name username profilePic');
  
      if (!currentUser) {
        return res.status(StatusCodes.NOT_FOUND).json({ message: "Current user not found." });
      }
  
      // Create sets for quick lookup
      const receivedRequestIds = new Set(currentUser.receivedRequests.map(user => user._id.toString()));
      const sentRequestIds = new Set(currentUser.sentRequests.map(user => user._id.toString()));
      const friendIds = new Set(currentUser.friends.map(user => user._id.toString()));
      const blockedUserIds = new Set(currentUser.blockedUsers.map(user => user._id.toString()));
  
      // Prepare the filtered users with status
      const filteredUsers = users.map(user => {
        const userId = user._id.toString();
        let status = 'none';
  
        // Assign status based on relationship
        if (receivedRequestIds.has(userId)) {
          status = 'received';
        } else if (sentRequestIds.has(userId)) {
          status = 'sent';
        } else if (friendIds.has(userId)) {
          status = 'friend';
        } else if (blockedUserIds.has(userId)) {
          status = 'blocked';
        }
  
        return {
          _id: user._id,
          full_name: user.full_name,
          username: user.username,
          profilePic: user.profilePic,
          status
        };
      });
  
      // Categorize users into the different groups
      const addNewConnection = filteredUsers.filter(user => user.status === 'none');
      const sentRequests = filteredUsers.filter(user => user.status === 'sent');
      const receivedRequests = filteredUsers.filter(user => user.status === 'received');
      const connectionManagement = filteredUsers.filter(user => user.status === 'friend');
  
      res.status(StatusCodes.OK).json({
        status: 'success',
        data: {
          addNewConnection,
          sentRequests,
          receivedRequests,
          connectionManagement
        },
        // currentUserData: {
        //   sentRequests: currentUser.sentRequests,
        //   receivedRequests: currentUser.receivedRequests,
        //   friends: currentUser.friends,
        //   blockedUsers: currentUser.blockedUsers
        // },
      });
    } catch (error) {
      console.error('Error in getAllUsers:', error);
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: "Server error" });
    }
  };