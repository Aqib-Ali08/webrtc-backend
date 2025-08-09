import express from 'express';
import {
  sendFriendRequest,
  acceptFriendRequest,
  cancelFriendRequest,
  toggleBlockUser,
  disconnectFriend
} from '../controllers/friend.controller.js';
import authenticateToken from '../middlewares/authenticateToken.middleware.js';

const router = express.Router();

router.post('/sendRequest', authenticateToken, sendFriendRequest);
router.post('/acceptRequest', authenticateToken, acceptFriendRequest);
router.post('/cancelRequest', authenticateToken, cancelFriendRequest);
router.post('/toggleUserBlock', authenticateToken, toggleBlockUser);
router.post('/disconnectFriend', authenticateToken, disconnectFriend);

export default router;
