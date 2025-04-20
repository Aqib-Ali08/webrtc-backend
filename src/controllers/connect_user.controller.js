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
    const currentUserId = req.user.id; // Get the ID of the currently authenticated user

    // Fetch all users except the current user
    const users = await User.find({ _id: { $ne: currentUserId } }).select('full_name username profilePic'); // Exclude password and other sensitive info

    if (users.length === 0) {
      return res.status(404).json({ message: "No users found." });
    }

    res.status(200).json(users);
  } catch (error) {
    console.error('Error in getAllUsersExceptCurrent:', error);
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
