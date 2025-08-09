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
  const targetUserId = req.body.senderId; // Sender means who sent the request to current user

  try {
    const currentUser = await User.findById(currentUserId);
    const targetUser = await User.findById(targetUserId);

    if (!currentUser || !targetUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    console.log('Before cancelling:');
    console.log('currentUser.receivedRequests:', currentUser.receivedRequests);
    console.log('targetUser.sentRequests:', targetUser.sentRequests);

    // Remove targetUserId from currentUser.receivedRequests
    currentUser.receivedRequests = currentUser.receivedRequests.filter(
      id => id.toString() !== targetUserId
    );

    // Remove currentUserId from targetUser.sentRequests
    targetUser.sentRequests = targetUser.sentRequests.filter(
      id => id.toString() !== currentUserId
    );

    console.log('After cancelling:');
    console.log('currentUser.receivedRequests:', currentUser.receivedRequests);
    console.log('targetUser.sentRequests:', targetUser.sentRequests);

    await currentUser.save();
    await targetUser.save();

    res.status(200).json({ message: 'Friend request cancelled/deleted' });
  } catch (err) {
    console.error('Error cancelling friend request:', err);
    res.status(500).json({ message: 'Server error' });
  }
};


// Block/Unblock User
export const toggleBlockUser = async (req, res) => {
  const currentUserId = req.user.id;
  const targetUserId = req.body.userId;
  const actionType = req.body.action_type; // "BLOCK" or "UNBLOCK"

  if (!["BLOCK", "UNBLOCK"].includes(actionType)) {
    return res.status(400).json({ message: 'Invalid action_type. Must be "BLOCK" or "UNBLOCK".' });
  }

  try {
    const currentUser = await User.findById(currentUserId);
    const targetUser = await User.findById(targetUserId);

    if (!currentUser || !targetUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (actionType === "UNBLOCK") {
      // Remove from blocked users
      currentUser.blockedUsers = currentUser.blockedUsers.filter(
        id => id.toString() !== targetUserId
      );
      await currentUser.save();
      return res.status(200).json({ message: 'User unblocked successfully' });
    }

    if (actionType === "BLOCK") {
      // Remove mutual friendship
      currentUser.friends = currentUser.friends.filter(
        id => id.toString() !== targetUserId
      );
      targetUser.friends = targetUser.friends.filter(
        id => id.toString() !== currentUserId
      );

      // Add to blocked users
      if (!currentUser.blockedUsers.includes(targetUserId)) {
        currentUser.blockedUsers.push(targetUserId);
      }

      await currentUser.save();
      await targetUser.save();
      return res.status(200).json({ message: 'User blocked successfully' });
    }

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

export const disconnectFriend = async (req, res) => {
  const userId = req.user.id;
  const targetUserId = req.body.targetUserId;

  try {
    await Promise.all([
      User.findByIdAndUpdate(userId, {
        $pull: { friends: targetUserId, blockedUsers: targetUserId }
      }),
      User.findByIdAndUpdate(targetUserId, {
        $pull: { friends: userId, blockedUsers: userId }
      })
    ]);

    res.status(200).json({ message: 'User removed successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};


