import express from 'express';
import { login, refreshAccessToken, register } from '../controllers/auth.controllers.js';
import authenticateToken from '../middlewares/authenticateToken.middleware.js';
import { acceptFriendRequest, cancelFriendRequest, getAllUsers, sendFriendRequest, toggleBlockUser } from '../controllers/connect_user.controller.js';



const router = express.Router();

// Register route
router.post('/auth/register', register);

// Login route
router.post('/auth/login', login);
// Refresh Token
router.post('/auth/refreshToken', refreshAccessToken);


router.post('/connect/sendRequest', authenticateToken, sendFriendRequest);
router.post('/connect/acceptRequest', authenticateToken, acceptFriendRequest);
router.post('/connect/cancelRequest', authenticateToken, cancelFriendRequest);

router.post('/users/block', authenticateToken, toggleBlockUser);
router.get('/users', authenticateToken, getAllUsers);
// Protected route
router.get('/auth/protected', authenticateToken, (req, res) => {
  res.send(`${req.user.username} is a valid user`);
});

export default router;
