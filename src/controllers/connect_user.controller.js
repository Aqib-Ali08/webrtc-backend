import User from "../models/user.model.js";

export const sendFriendRequest = async (req, res) => {
  try {
    const senderId = req.user.id; // from token
    const { receiverId } = req.body;

    if (senderId === receiverId) {
      return res.status(400).json({ message: "You can't send request to yourself." });
    }

    const sender = await User.findById(senderId);
    const receiver = await User.findById(receiverId);

    if (!receiver) {
      return res.status(404).json({ message: "Receiver not found." });
    }

    // Prevent duplicates
    if (
      receiver.receivedRequests.includes(senderId) ||
      receiver.friends.includes(senderId) ||
      receiver.blockedUsers.includes(senderId)
    ) {
      return res.status(400).json({ message: "Request already sent or user already connected/blocked." });
    }

    // Update both users
    receiver.receivedRequests.push(senderId);
    sender.sentRequests.push(receiverId);

    await receiver.save();
    await sender.save();

    return res.status(200).json({ message: "Friend request sent." });
  } catch (error) {
    console.error("Send request error:", error);
    res.status(500).json({ message: "Something went wrong." });
  }
};

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
      return res.status(404).json({ message: "Current user not found." });
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
    const receivedRequests = filteredUsers.filter(user => user.status === 'sent');
    const connectionManagement = filteredUsers.filter(user => user.status === 'friend');

    res.status(200).json({
      status: 'success',
      data: {
        addNewConnection,
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
    res.status(500).json({ message: "Server error" });
  }
};



export const acceptFriendRequest = async (req, res) => {
  const currentUserId = req.user.id;
  const senderId = req.body.senderId;

  try {
    const currentUser = await User.findById(currentUserId);
    const senderUser = await User.findById(senderId);

    if (!currentUser.receivedRequests.includes(senderId)) {
      return res.status(400).json({ message: 'No such friend request' });
    }

    currentUser.friends.push(senderId);
    senderUser.friends.push(currentUserId);

    currentUser.receivedRequests = currentUser.receivedRequests.filter(id => id.toString() !== senderId);
    senderUser.sentRequests = senderUser.sentRequests.filter(id => id.toString() !== currentUserId);

    await currentUser.save();
    await senderUser.save();

    res.status(200).json({ message: 'Friend request accepted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Cancel/Delete Friend Request
export const cancelFriendRequest = async (req, res) => {
  const currentUserId = req.user.id;
  const targetUserId = req.body.userId;

  try {
    const currentUser = await User.findById(currentUserId);
    const targetUser = await User.findById(targetUserId);

    currentUser.sentRequests = currentUser.sentRequests.filter(id => id.toString() !== targetUserId);
    targetUser.receivedRequests = targetUser.receivedRequests.filter(id => id.toString() !== currentUserId);

    await currentUser.save();
    await targetUser.save();

    res.status(200).json({ message: 'Friend request cancelled/deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Block/Unblock User
export const toggleBlockUser = async (req, res) => {
  const currentUserId = req.user.id;
  const targetUserId = req.body.userId;

  try {
    const currentUser = await User.findById(currentUserId);

    const isBlocked = currentUser.blockedUsers.includes(targetUserId);

    if (isBlocked) {
      currentUser.blockedUsers = currentUser.blockedUsers.filter(id => id.toString() !== targetUserId);
      await currentUser.save();
      return res.status(200).json({ message: 'User unblocked' });
    } else {
      // Remove any friend connection before blocking
      currentUser.friends = currentUser.friends.filter(id => id.toString() !== targetUserId);
      currentUser.blockedUsers.push(targetUserId);
      await currentUser.save();
      return res.status(200).json({ message: 'User blocked' });
    }
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};
