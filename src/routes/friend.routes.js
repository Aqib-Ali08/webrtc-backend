import express from 'express';
import {
  sendFriendRequest,
  acceptFriendRequest,
  cancelFriendRequest,
  toggleBlockUser
} from '../controllers/friend.controller.js';
import authenticateToken from '../middlewares/authenticateToken.middleware.js';

const router = express.Router();

router.post('/sendRequest', authenticateToken, sendFriendRequest);
router.post('/acceptRequest', authenticateToken, acceptFriendRequest);
router.post('/cancelRequest', authenticateToken, cancelFriendRequest);
router.post('/block', authenticateToken, toggleBlockUser);

export default router;
